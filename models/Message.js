const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    room: {
        type: String,
        default: 'general' // used later for DMs / task-specific rooms
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
