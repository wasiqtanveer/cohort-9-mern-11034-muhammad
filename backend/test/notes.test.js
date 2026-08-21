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

        it("deletes a note the user owns", async function () {
            const note = await createNoteAs(tokenA, "Delete me", "<p>x</p>");

            const res = await request(app)
                .delete(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenA}`);

            expect(res.status).to.equal(200);

            const after = await request(app)
                .get(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenA}`);

            expect(after.status).to.equal(404);
        });

        it("returns 404 when deleting someone elses note", async function () {
            const note = await createNoteAs(tokenA, "A note", "<p>a</p>");

            const res = await request(app)
                .delete(`/api/notes/${note.id}`)
                .set("Authorization", `Bearer ${tokenB}`);

            expect(res.status).to.equal(404);
        });
    });

})