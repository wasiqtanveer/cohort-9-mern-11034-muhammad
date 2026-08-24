const express = require("express");
const {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    setPin,
    getTrash,
    restoreNote,
    deleteNotePermanently,
} = require("../controllers/notesController");
const {protect} = require("../middleware/authMiddleware")


const router = express.Router();

//every notes route need a logged in user, so we can use the protect middleware for all of them
router.use(protect)

//this HAS to come before /:id. express matches in order, so with /:id first
//a request for /notes/trash would bind id = "trash" and fail validation with a 400
router.get("/trash", getTrash);

router.route("/").get(getNotes)
router.route("/:id").get(getNote)
router.post("/", createNote);
router.put("/:id", updateNote);

//moves the note to the trash rather than destroying it
router.delete("/:id", deleteNote);

//patch not put, these change one field rather than replacing the whole note
router.patch("/:id/pin", setPin);
router.patch("/:id/restore", restoreNote);

//the only route that actually removes a row
router.delete("/:id/permanent", deleteNotePermanently);

module.exports = router;
