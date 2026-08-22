const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const { get } = require('mongoose');
const { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist } = require('../controllers/taskControllers');

const router = express.Router();

// task management routes
router.get("/dashboard-data", protect, adminOnly, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTasks); //get all tasks (admin: all, user: assigned to user)
router.get("/:id", protect, getTaskById); //get task by id
router.post("/", protect, adminOnly, createTask); //create task (admin only)
router.put("/:id", protect, updateTask); //update task by id 
router.delete("/:id", protect, adminOnly, deleteTask); //delete task by id (admin only)
router.put("/:id/status", protect, updateTaskStatus); //update task status by id
router.put("/:id/todo", protect, updateTaskChecklist); //update task todo by id

module.exports = router