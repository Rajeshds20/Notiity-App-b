const mongoose = require('mongoose')

const bucketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
    }
});

bucketModel = mongoose.model('Bucket', bucketSchema);

module.exports = bucketModel;