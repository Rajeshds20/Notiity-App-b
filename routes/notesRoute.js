const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Note = require('../models/Note')

const Authentication = require('../middleware/UserAuth')


// Create a new Note
router.post('/new', Authentication, async (req, res) => {
    try {
        const { title, content } = req.body

        // Create new note
        const newNote = await Note({
            title: title,
            content: content,
            user: req.user._id,
        })

        const user = await User.findById(req.user._id)
        user.notes.push(newNote._id)

        // Save note
        await newNote.save();
        await user.save();

        res.json({ message: "Note Created Successfully", newNote })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Get all notes of a user
router.get('/all', Authentication, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('notes')
        res.json({ notes: user.notes })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Update a note by id
router.put('/:id', Authentication, async (req, res) => {
    try {
        const noteId = req.params.id
        const { title, content } = req.body
        const note = Note.findById(noteId)
        if (!note) {
            return res.status(404).json({ message: "Note not found" })
        }
        await Note.findByIdAndUpdate(noteId, { title: title, content: content })
        res.json({ message: "Note updated successfully" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Delete a note by id
router.delete('/:id', Authentication, async (req, res) => {
    try {
        const noteId = req.params.id
        const note = Note.findById(noteId)
        if (!note) {
            return res.status(404).json({ message: "Note not found" })
        }
        await Note.deleteOne(note);
        res.json({ message: "Note deleted successfully" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Delete all notes of a user
router.delete('/all', Authentication, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        user.notes = []
        await user.save()
        res.json({ message: "All notes deleted successfully" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Update Order of user's notes
router.patch('/update', Authentication, async (req, res) => {
    try {
        const { notes } = req.body
        const user = await User.findById(req.user._id)
        user.notes = notes
        await user.save()
        res.json({ message: "Notes order updated successfully" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;
