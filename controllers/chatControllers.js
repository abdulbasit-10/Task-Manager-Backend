const Message = require('../models/Message');
const User = require('../models/User');

// build a consistent room id for two users regardless of order
const getDMRoomId = (id1, id2) => {
    return [id1.toString(), id2.toString()].sort().join('_');
};

// desc Get group chat message history
// route GET /api/chat/group
// access Private
const getGroupMessages = async (req, res) => {
    try {
        const messages = await Message.find({ room: 'general' })
            .sort({ createdAt: 1 })
            .populate('sender', 'name profileImageUrl');

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// desc Get list of people you can message (everyone except yourself)
// route GET /api/chat/contacts
// access Private
const getContacts = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select("name email profileImageUrl role");

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// desc Get direct message history with a specific user
// route GET /api/chat/dm/:userId
// access Private
const getDirectMessages = async (req, res) => {
    try {
        const roomId = getDMRoomId(req.user._id, req.params.userId);
        const messages = await Message.find({ room: roomId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name profileImageUrl');

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { getGroupMessages, getContacts, getDirectMessages, getDMRoomId };
