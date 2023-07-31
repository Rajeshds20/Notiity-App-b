const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    mailid: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    }
});

adminModel = mongoose.model('Admin', AdminSchema);
module.exports = adminModel;