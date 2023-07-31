const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    mailid: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note',
        }
    ]
});

userModel = mongoose.model('User', UserSchema);

module.exports = userModel;
