const pool = require("../config/db")
const sanitizeHtml = require("sanitize-html")


//postgres throws a cast error if the id isnt a number, so catch it here as a 400
function validateNoteId(id){
    if(!/^[1-9]\d*$/.test(id)){
        const err = new Error("Invalid note id");
        err.status = 400;
        throw err;
    }
}

//title.trim() blows up if someone sends a number instead of a string
function validateNoteInput(title, content){
    if(typeof title !== "string" || !title.trim()){
        const err = new Error("Title is required");
        err.status = 400;
        throw err;
    }

    //the column is VARCHAR(200) so anything longer would be a db error
    if(title.trim().length > 200){
        const err = new Error("Title must not exceed 200 characters");
        err.status = 400;
        throw err;
    }

    if(content !== undefined && typeof content !== "string"){
        const err = new Error("Content must be a string");
        err.status = 400;
        throw err;
    }
}


//fetch all the notes that belong to the current logged in user
async function getNotes(req,res) {
        const result = await pool.query(
        `SELECT id, title, content, is_pinned, created_at, updated_at
        FROM notes
        WHERE user_id = $1 AND deleted_at IS NULL
        ORDER BY is_pinned DESC, updated_at DESC`,
        [req.user.id]
    )

    res.json({notes: result.rows})
}


//get one note IFF it belong to the logged in user
async function getNote(req,res) {
    validateNoteId(req.params.id);

    const result = await pool.query(
        `SELECT id, title, content, is_pinned, created_at, updated_at
        FROM notes
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
        [req.params.id, req.user.id]
    )

    const note = result.rows[0];

    if(!note){
        //404 tell them notes dont exist, not that they exist but belong to someone else
        const err = new Error("Note not found");
        err.status = 404;
        throw err;
    }

    res.json({note})
}


//since quill editor send HTMl so we strip anyting that could run JS
const sanitizeOptions ={
    allowedTags: ["p","br","strong","em","u","s","h1","h2","h3","ul","ol","li","blockquote","a","code","pre"],
    allowedAttributes: {a: ["href","target","rel"]},
}

async function createNote(req,res)
{
    const{title,content} = req.body ?? {};

    validateNoteInput(title, content);

    // even if the forntend is sanitized we can still have issue
    const cleanContent = sanitizeHtml(content || "", sanitizeOptions);

    const result = await pool.query(
        `INSERT INTO notes (user_id, title, content)
         VALUES ($1, $2, $3)
         RETURNING id, title, content, is_pinned, created_at, updated_at`,
         [req.user.id, title.trim(), cleanContent]
    )

     //notes titles and text is private to user so, so only ids are logged
    req.log.info({event: "note_created", userId: req.user.id, noteId: result.rows[0].id}, "note created");

    res.status(201).json({note: result.rows[0]})

}


async function updateNote(req,res){
    const{title, content} = req.body ?? {};


    validateNoteId(req.params.id);
    validateNoteInput(title, content);

     const cleanContent = sanitizeHtml(content || "", sanitizeOptions);

    const result = await pool.query(
        `
        UPDATE notes
        SET title = $1, content= $2, updated_at = NOW()
        WHERE id = $3 AND user_id = $4
        AND deleted_at IS NULL
        RETURNING id, title, content ,is_pinned, created_at, updated_at
        `,
        [title.trim(), cleanContent, req.params.id, req.user.id]
    );

    const note  =result.rows[0]

    if(!note){
        const err = new Error("Note not Found");
        err.status = 404;
        throw err;
    }

    req.log.info({event: "note_updated", userId: req.user.id, noteId: note.id}, "note updated");


    res.json({note});
}

async function deleteNote(req, res) {
    validateNoteId(req.params.id);

    const result = await pool.query(
        `UPDATE notes
         SET deleted_at = NOW(), is_pinned = FALSE
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
         RETURNING id`,
        [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
        const err = new Error("Note not found");
        err.status = 404;
        throw err;
    }

    req.log.info({event: "note_trashed", userId: req.user.id, noteId: result.rows[0].id}, "note moved to trash");

    res.json({message: "Note moved to trash"});
}


async function getTrash(req, res) {
    const purged = await pool.query(
        `DELETE FROM notes
         WHERE user_id = $1
           AND deleted_at IS NOT NULL
           AND deleted_at < NOW() - INTERVAL '7 days'
         RETURNING id`,
        [req.user.id]
    );

    //this is the only place data is destroyed without the user asking, so it is
    //worth a line. quiet when there was nothing to purge, which is most of the time
    if (purged.rows.length > 0) {
        req.log.info(
            {event: "trash_purged", userId: req.user.id, count: purged.rows.length},
            "expired notes purged from trash"
        );
    }

    const result = await pool.query(
        `SELECT id, title, content, created_at, updated_at, deleted_at
         FROM notes
         WHERE user_id = $1 AND deleted_at IS NOT NULL
         ORDER BY deleted_at DESC`,
        [req.user.id]
    );

    res.json({notes: result.rows});
}


async function restoreNote(req, res) {
    validateNoteId(req.params.id);

    //deleted_at IS NOT NULL means only a trashed note can be restored,so calling this on a live note is a 404 rather than a silent no-op
    const result = await pool.query(
        `UPDATE notes
         SET deleted_at = NULL
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL
         RETURNING id, title, content, is_pinned, created_at, updated_at`,
        [req.params.id, req.user.id]
    );

    const note = result.rows[0];

    if (!note) {
        const err = new Error("Note not found");
        err.status = 404;
        throw err;
    }

    req.log.info({event: "note_restored", userId: req.user.id, noteId: note.id}, "note restored from trash");

    res.json({note});
}


//the only real DELETE left in the app
async function deleteNotePermanently(req, res) {
    validateNoteId(req.params.id);

    //restricted to rows already in the trash, so this route can never destroy a live note
    const result = await pool.query(
        `DELETE FROM notes
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL
         RETURNING id`,
        [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
        const err = new Error("Note not found");
        err.status = 404;
        throw err;
    }

    //warn rather than info, this is the one action in the app that is unrecoverable
    req.log.warn({event: "note_deleted_permanently", userId: req.user.id, noteId: result.rows[0].id}, "note permanently deleted");

    res.json({message: "Note deleted"});
}


//takes an explicit true/false rather than flipping whatever is in the db. a plain toggle would drift out of sync with the ui if two clicks landed close together

async function setPin(req, res) {
    const {is_pinned} = req.body ?? {};

    validateNoteId(req.params.id);

    if (typeof is_pinned !== "boolean") {
        const err = new Error("is_pinned must be true or false");
        err.status = 400;
        throw err;
    }

    //deliberately not touching updated_at, pinning is not an edit and shouldnt,  jump the note to the top of the recently updated sort

    const result = await pool.query(
        `UPDATE notes
         SET is_pinned = $1
         WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
         RETURNING id, title, content, is_pinned, created_at, updated_at`,
        [is_pinned, req.params.id, req.user.id]
    );

    const note = result.rows[0];

    if (!note) {
        const err = new Error("Note not found");
        err.status = 404;
        throw err;
    }

    req.log.info({event: "note_pin_changed", userId: req.user.id, noteId: note.id, is_pinned}, "note pin changed");

    res.json({note});
}


module.exports = {  getNotes,getNote,createNote,updateNote,deleteNote,setPin,getTrash,restoreNote,deleteNotePermanently,};