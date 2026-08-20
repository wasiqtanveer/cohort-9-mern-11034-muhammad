const pool = require("../config/db")
const sanitizeHtml = require("sanitize-html")


//fetch all the notes that belong to the current logged in user
async function getNotes(req,res) {
    const result = await pool.query(
        `SELECT id, title, content, created_at, updated_at
        FROM notes
        WHERE user_id = $1
        ORDER BY updated_at DESC`,
        [req.user.id]
    )

    res.json({notes: result.rows})
}


//get one note IFF it belong to the logged in user
async function getNote(req,res) {
    const result = await pool.query(
        `SELECT id, title, content, created_at, updated_at
        FROM notes
        WHERE id = $1 AND user_id = $2`,
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
    const{title,content} = req.body;

    if(!title || !title.trim()){
        const err = new Error("Title is required");
        err.status = 400;
        throw err;
    }

    // even if the forntend is sanitized we can still have issue 
    const cleanContent = sanitizeHtml(content || "", sanitizeOptions);

    const result = await pool.query(
        `INSERT INTO notes (user_id, title, content)
         VALUES ($1, $2, $3)
         RETURNING id, title, content, created_at, updated_at`,
         [req.user.id, title.trim(), cleanContent]
    )

    res.status(201).json({note: result.rows[0]})

}


async function updateNote(req,res){
    const{title, content} = req.body;

    if(!title || !title.trim()){
        const err = new Error("Title is required");
        err.status = 400;
        throw err;
    }

     const cleanContent = sanitizeHtml(content || "", sanitizeOptions);

    const result = await pool.query(
        `
        UPDATE notes
        SET title = $1, content= $2, updated_at = NOW()
        WHERE id = $3 AND user_id = $4
        RETURNING id, title, content , created_at, updated_at
        `,
        [title.trim(), cleanContent, req.params.id, req.user.id]
    );

    const note  =result.rows[0]

    if(!note){
        const err = new Error("Note not Found");
        err.status = 404;
        throw err;
    }

    res.json({note});
}

async function deleteNote(req, res) {
    const result = await pool.query(
        `DELETE FROM notes
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
        const err = new Error("Note not found");
        err.status = 404;
        throw err;
    }

    res.json({message: "Note deleted"});
}


module.exports = {getNotes, getNote, createNote, updateNote, deleteNote};