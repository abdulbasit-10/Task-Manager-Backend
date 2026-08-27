require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Message = require('./models/Message');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');
const chatRoutes = require('./routes/chatRoutes');

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

        console.log("✅ Default admin created:", ADMIN_EMAIL);
    } catch (error) {
        console.error("Error creating default admin:", error.message);
    }
};

setTimeout(createDefaultAdmin, 2000);

app.get('/', (req, res) => {
    res.status(200).send('<h1>Welcome to My Node.js API!</h1><p>This API serves user data. Use the /api/users endpoint to interact with the user resources.</p>');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);

// server upload folder 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Socket.io setup (needs a raw http server instead of app.listen directly) ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// Authenticate every socket connection using the same JWT used for the REST API
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Not authorized'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (error) {
        next(new Error('Not authorized'));
    }
});

io.on('connection', (socket) => {
    // Everyone joins the single "general" room for now (group chat)
    socket.join('general');

    socket.on('sendGroupMessage', async (text) => {
        try {
            if (!text || !text.trim()) return;

            const message = await Message.create({
                sender: socket.userId,
                text: text.trim(),
                room: 'general',
            });

            const populated = await message.populate('sender', 'name profileImageUrl');

            io.to('general').emit('newGroupMessage', populated);
        } catch (error) {
            console.error('Error sending group message:', error.message);
        }
    });

    // Direct messages
    socket.on('joinDM', (otherUserId) => {
        const roomId = [socket.userId.toString(), otherUserId.toString()].sort().join('_');
        socket.join(roomId);
    });

    socket.on('sendDirectMessage', async ({ to, text }) => {
        try {
            if (!text || !text.trim() || !to) return;

            const roomId = [socket.userId.toString(), to.toString()].sort().join('_');

            const message = await Message.create({
                sender: socket.userId,
                text: text.trim(),
                room: roomId,
            });

            const populated = await message.populate('sender', 'name profileImageUrl');

            io.to(roomId).emit('newDirectMessage', populated);
        } catch (error) {
            console.error('Error sending direct message:', error.message);
        }
    });

    socket.on('disconnect', () => {
        // no-op for now
    });
});

// Server
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
