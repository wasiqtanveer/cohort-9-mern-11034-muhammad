const express = require("express");
const {getNotes, getNote, createNote, updateNote, deleteNote} = require("../controllers/notesController");
const {protect} = require("../middleware/authMiddleware")


const router = express.Router();

//every notes route need a logged in user, so we can use the protect middleware for all of them
router.use(protect)

router.route("/").get(getNotes)
router.route("/:id").get(getNote)
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;