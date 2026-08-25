const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const { getUsers, getUserById, deleteUser, toggleUserStatus } = require('../controllers/userControllers');

const router = express.Router();

//  User Management routes
router.get("/", protect, adminOnly, getUsers); //get all users (admin only)
router.get("/:id", protect, getUserById); //get user by id 
router.delete("/:id", protect, adminOnly, deleteUser); //delete user by id (admin only)
router.put("/:id/status", protect, adminOnly, toggleUserStatus); //activate/deactivate user (admin only)

module.exports = router
