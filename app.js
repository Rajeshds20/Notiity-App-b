// Import necessary packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

const userRoute = require('./routes/userRoute')
const notesRoute = require('./routes/notesRoute')
const adminRoute = require('./routes/adminRoute')
const bucketRoute = require('./routes/bucketRoute')
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


// User route for logging in and registering
app.use('/user', userRoute)

// Notes route for creating, updating and deleting notes
app.use('/notes', notesRoute)

// API's for Admin Panel
app.use('/admin', adminRoute)

// Bucket route for creating, updating and deleting buckets
app.use('/bucket', bucketRoute)


// Start server
app.listen(port, () => console.log(`Notiify app listening on port ${port}!`))
