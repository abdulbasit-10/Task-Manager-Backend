require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware to handle CORS
app.use(cors());

// Middlewares
app.use(express.json());

// Connect to MongoDB
connectDB();

// Create a default admin account if one doesn't already exist
const createDefaultAdmin = async () => {
    try {
        const ADMIN_EMAIL = "admin@taskmanager.com";
        const ADMIN_PASSWORD = "Admin@12345";

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) return;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        await User.create({
            name: "Admin",
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin",
        });

        console.log("✅ Admin created:", ADMIN_EMAIL);
    } catch (error) {
        console.error("Error creating admin:", error.message);
    }
};

// Small delay to make sure MongoDB has connected first
setTimeout(createDefaultAdmin, 2000);

app.get('/', (req, res) => {
    res.status(200).send('<h1>Welcome to My Node.js API!</h1><p>This API serves user data. Use the /api/users endpoint to interact with the user resources.</p>');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

// server upload folder 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
