const express = require('express');
const router = express.Router();
const Bucket = require('../models/Bucket');

async function codeGenerate() {
    let code = Math.floor(Math.random() * 1000000);
    const bucket = await Bucket.findOne({ code: code })
    if (bucket) {
        return codeGenerate();
    }
    return code;
}

// Create new bucket
router.post('/create', async (req, res) => {
    try {
        const { data, title } = req.body;
        if (!data) {
            return res.status(400).json({ message: "Please Include the data" })
        }

        // Generate a new 6 digit code not exist
        const code = await codeGenerate();

        const newBucket = await Bucket({
            title,
            code,
            content: data,
        })
        newBucket.save()
        res.json({ message: "Bucket Created Successfully", bucket: newBucket })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Get bucket by code
router.get('/:code', async (req, res) => {
    try {
        const code = req.params.code;
        if (!code) {
            return res.status(400).json({ message: "Please Include the code" })
        }
        const bucket = await Bucket.findOne({ code: code })
        if (!bucket) {
            return res.status(404).json({ message: "Bucket not found" })
        }
        res.json({ bucket: bucket })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;