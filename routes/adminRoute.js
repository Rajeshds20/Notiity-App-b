const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Note = require('../models/Note')
const Admin = require('../models/Admin')


// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
        res.json({ users: users })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})


// Get all notes
router.get('/notes', async (req, res) => {
    try {
        const notes = await Note.find()
        res.json({ notes: notes })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Delete a user by id
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        await user.delete()
        res.json({ message: "User deleted successfully" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Delete a note by id
router.delete('/notes/:id', async (req, res) => {
    try {
        const noteId = req.params.id
        const note = Note.findById(noteId)
        if (!note) {
            return res.status(404).json({ message: "Note not found" })
        }
        await User.findByIdAndUpdate(note.user, { $pull: { notes: noteId } })
        await note.delete()
        res.json({ message: "Note deleted successfully" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Get all notes of a user
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId).populate('notes')
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json({ notes: user.notes })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Add new Admin
router.post('/new', async (req, res) => {
    try {
        const { mailid, password } = req.body
        const admin = await Admin.findOne({ mailid: mailid })
        console.log(admin);
        if (!admin) {
            const hashedPassword = await bcrypt.hash(password, 10)
            const newAdmin = new Admin({
                mailid: mailid,
                password: hashedPassword
            })
            await newAdmin.save()
            res.json({ message: "Admin created successfully" })
        }
        else {
            res.status(400).json({ message: "Admin already exists", admin: admin })
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Admin Login - Authentication
router.post('/login', async (req, res) => {
    try {
        const { mailid, password } = req.body
        const admin = await Admin.findOne({ mailid: mailid })
        if (!admin) {
            return res.status(400).json({ message: "Admin does not exist" })
        }
        if (!bcrypt.compare(password, admin.password)) {
            return res.status(400).json({ message: "Password is incorrect" })
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.json({ message: "Admin Logged In Successfully", token: token })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Send notification to all users
router.post('/send', async (req, res) => {
    try {
        const { title, content } = req.body
        const users = await User.find()
        users.forEach(async (user) => {
            const newNote = await Note({
                title: title,
                content: content,
                user: user._id,
            })
            user.notes.push(newNote._id)
            await newNote.save();
            await user.save();
        })
        res.json({ message: "Notification sent successfully" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;