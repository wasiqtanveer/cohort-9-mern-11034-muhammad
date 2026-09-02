const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

async function register(req,res)
{
//type error come back as 500 instad of 400
    const body = req.body ?? {};

    const{name,password} = body

    //lowercase the email so User@test.com and user@test.com cant become two accounts
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : body.email

    if(!name || !email || !password)
    {
        const err = new Error("Name,Email, Password are required")
        err.status = 400;
        throw err;
    }

    if(password.length < 8)
    {
        const err = new Error("Password length must be atleast 8 characters");
        err.status  = 400;
        throw err;
    }

    const existing  = await pool.query("SELECT id FROM users WHERE email = $1",[email,]);

    if (existing.rows.length > 0)
    {
        const err = new Error("User with this email already exists");
        err.status = 409;
        throw err;
    }

    const passwordHash = await bcrypt.hash(password,10);

    const result = await pool.query(
        `INSERT INTO users(name, email,password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at`,
        [name,email,passwordHash]

    )


    //userId only, no email. the http log already carries the request id and ip for correlation, so no need to log the email and risk it being stored in a log file
    req.log.info({event: "user_registered", userId: result.rows[0].id}, "new user registered");
    res.status(201).json({user: result.rows[0]})

}

async function login(req,res)
{

    const body = req.body ?? {};
    //same lowercasing as register or the lookup wont match what we stored
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : body.email;
    const password = body.password;

    
    if(!email || !password)
    {
        const err = new Error("Email and Password are required");
        err.status = 400;
        throw err;
    }

    //finding user
    const result = await pool.query(
        "SELECT id,name,email,password_hash FROM users WHERE email = $1",[email]
    );

    const user = result.rows[0]

    if (!user) 
    {
        req.log.warn({event: "login_failed", reason: "unknown_email"}, "failed login attempt");
        const err = new Error("Invalid email or password");
        err.status = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password,user.password_hash)


    if (!isMatch) 
        {
            
            req.log.warn({event: "login_failed", reason: "wrong_password", userId: user.id}, "failed login attempt");

            const err = new Error("Invalid email or password");
            err.status = 401;
            throw err;
        }


    //credentials good then issue the JWT
    const token = jwt.sign(
        {id: user.id},process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES_IN,}
    )

        //the token itself is never logged, only that one was issued
    req.log.info({event: "user_logged_in", userId: user.id}, "user logged in");

    //sending safe use fields and never password hash

    res.status(200).json(
        {
            token,
            user:{id:user.id, name:user.name, email:user.email},
        }
    )
}

module.exports = {register, login}
