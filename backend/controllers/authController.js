const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

async function register(req,res)
{
    const{name,password} = req.body
    //lowercase the email so User@test.com and user@test.com cant become two accounts
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : req.body.email

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

    res.status(201).json({user: result.rows[0]})

}

async function login(req,res)
{
    //same lowercasing as register or the lookup wont match what we stored
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : req.body.email;
    const password = req.body.password;

    
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
        const err = new Error("Invalid email or password");
        err.status = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password,user.password_hash)


    if (!isMatch) 
        {
            const err = new Error("Invalid email or password");
            err.status = 401;
            throw err;
        }


    //credentials good then issue the JWT
    const token = jwt.sign(
        {id: user.id},process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES_IN,}
    )

    //sending safe use fields and never password hash

    res.status(200).json(
        {
            token,
            user:{id:user.id, name:user.name, email:user.email},
        }
    )
}

module.exports = {register, login}
