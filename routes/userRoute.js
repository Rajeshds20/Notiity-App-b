const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

// User Registration
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
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

module.exports = router;
