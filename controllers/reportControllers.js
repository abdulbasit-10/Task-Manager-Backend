const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

// @desc export all tasks as an excel file
// @route GET /api/reports/export/tasks
// @access Private
const exportTasksReport = async (req, res) => {
    try {
        // const tasks = new excelJS.Workbook();
        const tasks = await Task.find().populate("assignedTo", "name email"); // ✅ correct


        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");

        worksheet.columns = [
            { header: "Task ID", key: "_id", width: 25 },
            { header: "Title", key: "title", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Status", key: "status", width: 15 },
            { header: "Due Date", key: "dueDate", width: 15 },
            { header: "Priority", key: "priority", width: 15 },
            { header: "Assigned To", key: "assignedTo", width: 15 },
        ]

        tasks.forEach((task) => {
            const assignedTo = task.assignedTo.map((user) => `${user.name} (${user.email})`).join(", ");

            worksheet.addRow({
                _id: task._id,
                title: task.title,
                description: task.description,
                status: task.status,
                dueDate: task.dueDate.toISOString().split("T")[0],
                priority: task.priority,
                assignedTo: assignedTo || "N/A",
            });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=tasks.xlsx");

        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

// @desc export user-task report as excel file
// @route GET /api/reports/export/users
// @access Private
const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find().select("name email _id").lean();
        const userTasks = await Task.find().populate("assignedTo", "name email _id");

        const userTaskMap = {};
        users.forEach((user) => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inprogressTasks: 0,
                completedTasks: 0,
            };
        });

        userTasks.forEach((task) => {
            if (task.assignedTo) {
                task.assignedTo.forEach((assignedUser) => {
                    if (userTaskMap[assignedUser._id]) {
                        userTaskMap[assignedUser._id].taskCount += 1;
                        if (task.status === "Pending") {
                            userTaskMap[assignedUser._id].pendingTasks += 1;
                        }
                        else if (task.status === "In Progress") {
                            userTaskMap[assignedUser._id].inprogressTasks += 1;
                        }
                        else if (task.status === "Completed") {
                            userTaskMap[assignedUser._id].completedTasks += 1;
                        }

                    }
                })
            }
        })

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("User Task Report");

        worksheet.columns = [
            { header: "User Name", key: "name", width: 25 },
            { header: "Email", key: "email", width: 30 },
            { header: "Total Assigned Tasks", key: "taskCount", width: 15 },
            { header: "Pending Tasks", key: "pendingTasks", width: 15 },
            { header: "In Progress Tasks", key: "inprogressTasks", width: 15 },
            { header: "Completed Tasks", key: "completedTasks", width: 15 },
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=userstask.xlsx");
        return workbook.xlsx.write(res).then(() => {
            res.end();
        })

    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

module.exports = { exportTasksReport, exportUsersReport };