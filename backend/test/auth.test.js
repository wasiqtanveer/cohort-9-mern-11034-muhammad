const request = require("supertest");
const {expect} = require("chai");
const app = require("../app");
const pool = require("../config/db");
const { beforeEach } = require("mocha");




describe("Auth API", function()
{
    beforeEach(async function() //wipe userr table before each test so test dont depend on each other
    {
        await pool.query("TRUNCATE users RESTART IDENTITY");
    });

    //close the db connection after all the tests
    after(async function()
    {
        await pool.end;
    })

    describe("POST /api/auth/register", function()
    {
        it("creates a new user and returns 201", async function()
        {
            const res = await request(app)
                .post("/api/auth/register")
                .send({name: "wasiq", email:"wasiq@test.com",password:"password123"})
            
            expect(res.status).to.equal(201);
            expect(res.body.user).to.have.property("id");
            expect(res.body.user.email).to.equal("wasiq@test.com");

        })


        it("never sends the password hash back", async function () {
            const res = await request(app)
                .post("/api/auth/register")
                .send({name: "Wasiq", email: "wasiq@test.com", password: "password123"});

            expect(res.body.user).to.not.have.property("password_hash");
        });


        it("rejects a short password with 400", async function () {
            const res = await request(app)
                .post("/api/auth/register")
                .send({name: "Wasiq", email: "wasiq@test.com", password: "short"});

            expect(res.status).to.equal(400);
        });

        
        it("rejects a duplicate email with 409", async function () {
            await request(app)
                .post("/api/auth/register")
                .send({name: "Wasiq", email: "wasiq@test.com", password: "password123"});

            const res = await request(app)
                .post("/api/auth/register")
                .send({name: "Someone", email: "wasiq@test.com", password: "password123"});

            expect(res.status).to.equal(409);
        })
    })

    describe("POST /api/auth/login",function()
    {
        //since login test need a user to already exist then
        beforeEach(async function()
        {
            await request(app)
                .post("/api/auth/register")
                .send({name:"wasiq", email:"wasiq@test.com", password: "password123"})
        })
        
        
        it("returns a token for correct credentials", async function () {
            const res = await request(app)
                .post("/api/auth/login")
                .send({email: "wasiq@test.com", password: "password123"});

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("token");
            expect(res.body.user.email).to.equal("wasiq@test.com");
        });


         it("rejects a wrong password with 401", async function () {
            const res = await request(app)
                .post("/api/auth/login")
                .send({email: "wasiq@test.com", password: "wrongpassword"});

            expect(res.status).to.equal(401);
        });


         it("gives the same error for unknown email as for wrong password", async function () {
            const wrongPass = await request(app)
                .post("/api/auth/login")
                .send({email: "wasiq@test.com", password: "wrongpassword"});

            const noUser = await request(app)
                .post("/api/auth/login")
                .send({email: "nobody@test.com", password: "password123"});

            //both must look identical so nobody can find out which emails are registered
            expect(noUser.status).to.equal(wrongPass.status);
            expect(noUser.body.message).to.equal(wrongPass.body.message);
        });



            it("never sends the password hash back", async function () {
            const res = await request(app)
                .post("/api/auth/login")
                .send({email: "wasiq@test.com", password: "password123"});

            expect(res.body.user).to.not.have.property("password_hash");
        });
    })



    describe("GET /api/auth/me (protect middleware)", function(){

        let token;

        //register and login first time so we have a real token to test againt

        beforeEach(async function(){
            await request(app)
                .post("/api/auth/register")
                .send({name: "wasiq", email:"wasiq@test.com", password: "password123"})

            
            const res = await request(app)
                .post("/api/auth/login")
                .send({email: "wasiq@test.com", password: "password123"});

            token = res.body.token
        })

        it("returns the user when the token is valid", async function () {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.user.email).to.equal("wasiq@test.com");
        });


        it("rejects a request with no token", async function () {
            const res = await request(app).get("/api/auth/me");

            expect(res.status).to.equal(401);
        });


         it("rejects a made up token", async function () {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", "Bearer notarealtoken");

            expect(res.status).to.equal(401);
        });

        it("rejects a token that has been tampered with", async function () {
            //change the last character so the signature no longer matches
            const tampered = token.slice(0, -1) + (token.slice(-1) === "a" ? "b" : "a");

            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${tampered}`);

            expect(res.status).to.equal(401);
        });


    })
})