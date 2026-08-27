const express = require("express");
const {getNotes,getNote,createNote,updateNote,deleteNote,setPin,getTrash,restoreNote,deleteNotePermanently,} = require("../controllers/notesController");
const {protect} = require("../middleware/authMiddleware")


const router = express.Router();

// All notes routes require the user to be logged in.
router.use(protect);

// Keep /trash before /:id, otherwise "trash" would be treated as an ID.
router.get("/trash", getTrash);

router.route("/").get(getNotes);

router.route("/:id").get(getNote);

router.post("/", createNote);

router.put("/:id", updateNote);

// Move the note to trash instead of deleting it permanently.
router.delete("/:id", deleteNote);

// These only change one part of the note.
router.patch("/:id/pin", setPin);

router.patch("/:id/restore", restoreNote);

// This permanently deletes the note from the database.
router.delete("/:id/permanent", deleteNotePermanently);

module.exports = router;