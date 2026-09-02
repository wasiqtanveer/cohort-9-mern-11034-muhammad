const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  //Expect "Authorization: Bearer <token>"
  if (!authHeader?.startsWith("Bearer ")) {
    const err = new Error("Not authorized, no token provided");
    err.status = 401;
    throw err;
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    const err = new Error("Not authorized, token invalid");
    err.status = 401;
    throw err;
  }

  
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [decoded.id]
  );

  const user = result.rows[0];

  if (!user) {
    const err = new Error("Not authorized, user no longer exists");
    err.status = 401;
    throw err;
  }


  req.user = user;
  next();
}

module.exports = { protect };
