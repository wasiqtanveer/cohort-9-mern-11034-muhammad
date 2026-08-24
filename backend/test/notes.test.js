const request = require("supertest")
const {expect} = require("chai")
const app = require("../app")
const pool = require("../config/db");


describe("Notes API", function()
{
    //lets suppose 2 user so we can prove one cat reach the others notes
    let tokenA;
    let tokenB;

    beforeEach(async function () {
        await pool.query("TRUNCATE users RESTART IDENTITY CASCADE");

        await request(app)
            .post("/api/auth/register")
            .send({name: "User A", email: "a@test.com", password: "password123"});

        await request(app)
            .post("/api/auth/register")
            .send({name: "User B", email: "b@test.com", password: "password123"});

        const resA = await request(app)
            .post("/api/auth/login")
            .send({email: "a@test.com", password: "password123"});
        tokenA = resA.body.token;

        const resB = await request(app)
            .post("/api/auth/login")
            .send({email: "b@test.com", password: "password123"});
        tokenB = resB.body.token;
    })



        //small helper so tests dont repeat the same create call
    async function createNoteAs(token, title, content) {
        const res = await request(app)
            .post("/api/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({title, content});
        return res.body.note;
    }



    describe("POST /api/notes", function () {

        it("creates a note and returns 201", async function () {
            const res = await request(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`)
                .send({title: "My note", content: "<p>hello</p>"});

            expect(res.status).to.equal(201);
            expect(res.body.note).to.have.property("id");
            expect(res.body.note.title).to.equal("My note");
        });

        it("strips dangerous html from the content", async function () {
            const res = await request(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`)
                .send({title: "Bad", content: "<p>ok</p><script>alert(1)</script>"});

            expect(res.body.note.content).to.equal("<p>ok</p>");
            expect(res.body.note.content).to.not.include("script");
        });

        it("rejects a missing title with 400", async function () {
            const res = await request(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`)
                .send({content: "no title here"});

            expect(res.status).to.equal(400);
        });

        it("rejects a request with no token", async function () {
            const res = await request(app)
                .post("/api/notes")
                .send({title: "x", content: "y"});

            expect(res.status).to.equal(401);
        });

        it("rejects a title that is not a string with 400", async function () {
            const res = await request(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`)
                .send({title: 12345, content: "<p>x</p>"});

            //without validation title.trim() would throw and give a 500
            expect(res.status).to.equal(400);
        });

        it("rejects a request with no body at all with 400", async function () {
            //express 5 leaves req.body undefined rather than {}, which turned a
            //body-less request into a 500 before the controllers guarded it
            const res = await request(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(400);
        });

        it("rejects a title longer than 200 characters with 400", async function () {
            const res = await request(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`)
                .send({title: "a".repeat(201), content: "<p>x</p>"});

            expect(res.status).to.equal(400);
        });
    });



     describe("GET /api/notes", function () {

        it("returns an empty array when the user has no notes", async function () {
            const res = await request(app)
                .get("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(200);
            expect(res.body.notes).to.be.an("array").that.is.empty;
        });

        it("returns only the notes belonging to that user", async function () {
            await createNoteAs(tokenA, "A note", "<p>a</p>");
            await createNoteAs(tokenB, "B note", "<p>b</p>");

            const res = await request(app)
                .get("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.body.notes).to.have.lengthOf(1);
            expect(res.body.notes[0].title).to.equal("A note");
        });
    });

    describe("GET /api/notes/:id", function () {

        it("returns the note when it belongs to the user", async function () {
            const note = await createNoteAs(tokenA, "Mine", "<p>x</p>");

            const res = await request(app)
                .get(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(200);
            expect(res.body.note.title).to.equal("Mine");
        });

        it("returns 404 for a note owned by someone else", async function () {
            const note = await createNoteAs(tokenA, "A note", "<p>a</p>");

            const res = await request(app)
                .get(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenB}`);

            //404 not 403, so B cant even learn that the note exists
            expect(res.status).to.equal(404);
        });

        it("rejects a non numeric id with 400", async function () {
            const res = await request(app)
                .get("/api/notes/abc")
                .set("Authorization", `Bearer ${tokenA}`);

            //postgres would throw a cast error and give a 500 without this check
            expect(res.status).to.equal(400);
        });
    });

    describe("PUT /api/notes/:id", function () {

        it("updates a note the user owns", async function () {
            const note = await createNoteAs(tokenA, "Before", "<p>old</p>");

            const res = await request(app)
                .put(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({title: "After", content: "<p>new</p>"});

            expect(res.status).to.equal(200);
            expect(res.body.note.title).to.equal("After");
        });

        it("moves updated_at forward on edit", async function () {
            const note = await createNoteAs(tokenA, "Before", "<p>old</p>");

            const res = await request(app)
                .put(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({title: "After", content: "<p>new</p>"});

            //the dashboard sorts by updated_at so this has to actually move
            expect(new Date(res.body.note.updated_at).getTime())
                .to.be.greaterThan(new Date(note.updated_at).getTime());
        });

        it("returns 404 when updating someone elses note", async function () {
            const note = await createNoteAs(tokenA, "A note", "<p>a</p>");

            const res = await request(app)
                .put(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenB}`)
                .send({title: "hacked", content: "<p>bad</p>"});

            expect(res.status).to.equal(404);
        });

        it("leaves the note unchanged after a failed update attempt", async function () {
            const note = await createNoteAs(tokenA, "A note", "<p>a</p>");

            await request(app)
                .put(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenB}`)
                .send({title: "hacked", content: "<p>bad</p>"});

            const res = await request(app)
                .get(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.body.note.title).to.equal("A note");
        });
    });

    describe("DELETE /api/notes/:id", function () {

        it("moves the note to the trash instead of destroying it", async function () {
            const note = await createNoteAs(tokenA, "Delete me", "<p>x</p>");

            const res = await request(app)
                .delete(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(200);

            //gone from the notes list
            const after = await request(app)
                .get(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenA}`);

            expect(after.status).to.equal(404);

            //but still recoverable from the trash
            const trash = await request(app)
                .get("/api/notes/trash")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(trash.body.notes).to.have.lengthOf(1);
            expect(trash.body.notes[0].title).to.equal("Delete me");
        });

        it("returns 404 when deleting someone elses note", async function () {
            const note = await createNoteAs(tokenA, "A note", "<p>a</p>");

            const res = await request(app)
                .delete(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenB}`);

            expect(res.status).to.equal(404);
        });
    });

    describe("PATCH /api/notes/:id/pin", function () {

        it("pins a note the user owns", async function () {
            const note = await createNoteAs(tokenA, "Pin me", "<p>x</p>");

            const res = await request(app)
                .patch(`/api/notes/${note.id}/pin`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({is_pinned: true});

            expect(res.status).to.equal(200);
            expect(res.body.note.is_pinned).to.equal(true);
        });

        it("unpins a note again", async function () {
            const note = await createNoteAs(tokenA, "Pin me", "<p>x</p>");

            await request(app)
                .patch(`/api/notes/${note.id}/pin`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({is_pinned: true});

            const res = await request(app)
                .patch(`/api/notes/${note.id}/pin`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({is_pinned: false});

            expect(res.body.note.is_pinned).to.equal(false);
        });

        it("puts pinned notes at the top of the list", async function () {
            const older = await createNoteAs(tokenA, "Older", "<p>a</p>");
            await createNoteAs(tokenA, "Newer", "<p>b</p>");

            //without the pin, Newer would come first because of the updated_at sort
            await request(app)
                .patch(`/api/notes/${older.id}/pin`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({is_pinned: true});

            const res = await request(app)
                .get("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.body.notes[0].title).to.equal("Older");
        });

        it("does not move updated_at when pinning", async function () {
            const note = await createNoteAs(tokenA, "Pin me", "<p>x</p>");

            const res = await request(app)
                .patch(`/api/notes/${note.id}/pin`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({is_pinned: true});

            //pinning is not an edit, so it must not reorder the recently updated sort
            expect(new Date(res.body.note.updated_at).getTime())
                .to.equal(new Date(note.updated_at).getTime());
        });

        it("rejects a non boolean value with 400", async function () {
            const note = await createNoteAs(tokenA, "Pin me", "<p>x</p>");

            const res = await request(app)
                .patch(`/api/notes/${note.id}/pin`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({is_pinned: "yes"});

            expect(res.status).to.equal(400);
        });

        it("rejects a pin request with no body with 400", async function () {
            const note = await createNoteAs(tokenA, "Pin me", "<p>x</p>");

            const res = await request(app)
                .patch(`/api/notes/${note.id}/pin`)
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(400);
        });

        it("returns 404 when pinning someone elses note", async function () {
            const note = await createNoteAs(tokenA, "A note", "<p>a</p>");

            const res = await request(app)
                .patch(`/api/notes/${note.id}/pin`)
                .set("Authorization", `Bearer ${tokenB}`)
                .send({is_pinned: true});

            expect(res.status).to.equal(404);
        });

        it("rejects a pin request with no token", async function () {
            const note = await createNoteAs(tokenA, "A note", "<p>a</p>");

            const res = await request(app)
                .patch(`/api/notes/${note.id}/pin`)
                .send({is_pinned: true});

            expect(res.status).to.equal(401);
        });
    });

    describe("Trash", function () {

        //small helper, most trash tests need a note that is already deleted
        async function trashNoteAs(token, title, content) {
            const note = await createNoteAs(token, title, content);
            await request(app)
                .delete(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${token}`);
            return note;
        }

        it("returns an empty trash for a user who has deleted nothing", async function () {
            const res = await request(app)
                .get("/api/notes/trash")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(200);
            expect(res.body.notes).to.be.an("array").that.is.empty;
        });

        it("keeps one users trash out of anothers", async function () {
            await trashNoteAs(tokenA, "A note", "<p>a</p>");

            const res = await request(app)
                .get("/api/notes/trash")
                .set("Authorization", `Bearer ${tokenB}`);

            expect(res.body.notes).to.be.an("array").that.is.empty;
        });

        it("does not treat /trash as a note id", async function () {
            //with the route registered after /:id this would 400 on validateNoteId
            const res = await request(app)
                .get("/api/notes/trash")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(200);
        });

        it("clears the pin when a note is trashed", async function () {
            const note = await createNoteAs(tokenA, "Pinned", "<p>x</p>");

            await request(app)
                .patch(`/api/notes/${note.id}/pin`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({is_pinned: true});

            await request(app)
                .delete(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenA}`);

            const restored = await request(app)
                .patch(`/api/notes/${note.id}/restore`)
                .set("Authorization", `Bearer ${tokenA}`);

            //otherwise a restored note reappears stuck to the top of the list
            expect(restored.body.note.is_pinned).to.equal(false);
        });

        it("restores a trashed note back into the list", async function () {
            const note = await trashNoteAs(tokenA, "Bring me back", "<p>x</p>");

            const res = await request(app)
                .patch(`/api/notes/${note.id}/restore`)
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(200);

            const list = await request(app)
                .get("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(list.body.notes).to.have.lengthOf(1);
            expect(list.body.notes[0].title).to.equal("Bring me back");
        });

        it("returns 404 restoring a note that was never trashed", async function () {
            const note = await createNoteAs(tokenA, "Still here", "<p>x</p>");

            const res = await request(app)
                .patch(`/api/notes/${note.id}/restore`)
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(404);
        });

        it("returns 404 restoring someone elses trashed note", async function () {
            const note = await trashNoteAs(tokenA, "Mine", "<p>x</p>");

            const res = await request(app)
                .patch(`/api/notes/${note.id}/restore`)
                .set("Authorization", `Bearer ${tokenB}`);

            expect(res.status).to.equal(404);
        });

        it("permanently deletes a note that is in the trash", async function () {
            const note = await trashNoteAs(tokenA, "Gone for good", "<p>x</p>");

            const res = await request(app)
                .delete(`/api/notes/${note.id}/permanent`)
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(200);

            const trash = await request(app)
                .get("/api/notes/trash")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(trash.body.notes).to.be.an("array").that.is.empty;
        });

        it("refuses to permanently delete a note that is still live", async function () {
            const note = await createNoteAs(tokenA, "Still here", "<p>x</p>");

            const res = await request(app)
                .delete(`/api/notes/${note.id}/permanent`)
                .set("Authorization", `Bearer ${tokenA}`);

            //this route must never be able to destroy a note that is not in the trash
            expect(res.status).to.equal(404);

            const list = await request(app)
                .get("/api/notes")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(list.body.notes).to.have.lengthOf(1);
        });

        it("purges notes that have been in the trash for more than 7 days", async function () {
            const note = await trashNoteAs(tokenA, "Too old", "<p>x</p>");

            //backdate the deletion rather than waiting a week
            await pool.query(
                "UPDATE notes SET deleted_at = NOW() - INTERVAL '8 days' WHERE id = $1",
                [note.id]
            );

            const res = await request(app)
                .get("/api/notes/trash")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.body.notes).to.be.an("array").that.is.empty;

            //and it is really gone from the table, not just filtered out of the response
            const row = await pool.query("SELECT id FROM notes WHERE id = $1", [note.id]);
            expect(row.rows).to.have.lengthOf(0);
        });

        it("keeps notes that have been in the trash for less than 7 days", async function () {
            const note = await trashNoteAs(tokenA, "Still fresh", "<p>x</p>");

            await pool.query(
                "UPDATE notes SET deleted_at = NOW() - INTERVAL '6 days' WHERE id = $1",
                [note.id]
            );

            const res = await request(app)
                .get("/api/notes/trash")
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.body.notes).to.have.lengthOf(1);
            expect(res.body.notes[0].title).to.equal("Still fresh");
        });

        it("cannot edit a note that is in the trash", async function () {
            const note = await trashNoteAs(tokenA, "Trashed", "<p>x</p>");

            const res = await request(app)
                .put(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({title: "Edited", content: "<p>y</p>"});

            expect(res.status).to.equal(404);
        });

        it("cannot pin a note that is in the trash", async function () {
            const note = await trashNoteAs(tokenA, "Trashed", "<p>x</p>");

            const res = await request(app)
                .patch(`/api/notes/${note.id}/pin`)
                .set("Authorization", `Bearer ${tokenA}`)
                .send({is_pinned: true});

            expect(res.status).to.equal(404);
        });

        it("rejects a trash request with no token", async function () {
            const res = await request(app).get("/api/notes/trash");

            expect(res.status).to.equal(401);
        });
    });

})