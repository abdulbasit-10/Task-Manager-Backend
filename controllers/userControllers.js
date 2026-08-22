const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// desc Get all users (admin only)
// route GET /api/users
// access Private
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "member" }).select("-password");

        // Add task count to each user
        const usersWithTaskCount = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: "Pending" });
            const inprogressTasks = await Task.countDocuments({ assignedTo: user._id, status: "In Progress" });
            const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: "Completed" });

            return {
                ...user._doc, //include all existing user data
                pendingTasks,
                inprogressTasks,
                completedTasks
            };
        }))

        res.status(200).json(usersWithTaskCount);

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// desc Get user by id
// route GET /api/users/:id
// access Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// desc Delete user by id (admin only)
// route DELETE /api/users/:id
// access Private
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.deleteOne();
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { getUsers, getUserById, deleteUser };