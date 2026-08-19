const express = require ("express");
const {register, login} = require("../controllers/authController")
const {protect} = require("../middleware/authMiddleware")

const router = express.Router();

router.post("/register", register)
router.post("/login", login);

//protect runs first, only if it calls next() does this handler run
router.get("/me", protect, (req,res) => {
    res.json({user: req.user})
})

module.exports = router