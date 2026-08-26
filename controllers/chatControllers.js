const Message = require('../models/Message');

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

module.exports = { getGroupMessages };

