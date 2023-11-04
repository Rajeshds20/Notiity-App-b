// Import necessary packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const Authentication = require('./middleware/UserAuth')
const AdminAuth = require('./middleware/AdminAuth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./models/User')
const Note = require('./models/Note')
const Admin = require('./models/Admin')
// const bodyParser = require('body-parser')

// config dotenv
dotenv.config()

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database Connected'))

// Initialize express app
const app = express()
app.use(express.json())
app.use(cors())
// app.use(bodyParser.json())

const port = process.env.port || 5000;

app.get('/', (req, res) => res.send('Notiify App Server Running...'))


// API's for User

// New User - Register User
app.post('/user/register', async (req, res) => {
    try {
        const { mailid, password } = req.body
        if (!mailid || !password) {
            return res.status(400).json({ message: "Please enter all fields" })
        }
        // Check if user exists
        const user = await User.findOne({ mailid: mailid })
        if (user) {
            return res.status(403).json({ message: "User already exists" })
        }
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User({
            mailid: mailid,
            password: hashedPassword
        })

        // Save user
        await newUser.save()
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.json({ message: "User Created Successfully", token: token, user: newUser })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// User Login - Authentication
app.post('/user/login', async (req, res) => {
    try {
        const { mailid, password } = req.body

        if (!mailid || !password) {
            return res.status(400).json({ message: "Please enter all fields" })
        }

        // Check if user exists
        const user = await User.findOne({ mailid: mailid })

        if (!user) {
            return res.status(400).json({ message: "User does not exist" })
        }

        console.log(user.password, password);
        // Check if password is correct
        const check = await bcrypt.compare(password, user.password)
        if (!check) {
            return res.status(400).json({ message: "Password is incorrect" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.json({ message: "User Logged In Successfully", token: token })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Create a new Note
app.post('/notes/new', Authentication, async (req, res) => {
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
app.get('/notes/all', Authentication, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('notes')
        res.json({ notes: user.notes })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Update a note by id
app.put('/notes/:id', Authentication, async (req, res) => {
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
app.delete('/notes/:id', Authentication, async (req, res) => {
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
app.delete('/notes/all', Authentication, async (req, res) => {
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
app.patch('/notes/update', Authentication, async (req, res) => {
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

// API's for Admin Panel

// Get all users
app.get('/admin/users', AdminAuth, async (req, res) => {
    try {
        const users = await User.find()
        res.json({ users: users })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Get all notes
app.get('/admin/notes', AdminAuth, async (req, res) => {
    try {
        const notes = await Note.find()
        res.json({ notes: notes })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Delete a user by id
app.delete('/admin/users/:id', AdminAuth, async (req, res) => {
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
app.delete('/admin/notes/:id', AdminAuth, async (req, res) => {
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
app.get('/admin/users/:id', AdminAuth, async (req, res) => {
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
app.post('/admin/new', async (req, res) => {
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
app.post('/admin/login', async (req, res) => {
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

// Start server
app.listen(port, () => console.log(`Notiify app listening on port ${port}!`))
