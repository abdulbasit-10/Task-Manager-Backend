const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const { getUsers, getUserById, deleteUser } = require('../controllers/userControllers');

const router = express.Router();

//  User Management routes
router.get("/", protect, adminOnly, getUsers); //get all users (admin only)
router.get("/:id", protect, getUserById); //get user by id 
router.delete("/:id", protect, adminOnly, deleteUser); //delete user by id (admin only)

module.exports = router