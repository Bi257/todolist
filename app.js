require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs'); 
const taskController = require('./controllers/taskController');
const authController = require('./controllers/authController');
const User = require('./models/User'); 
const Task = require('./models/Task'); 
const app = express();


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: 'todo_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_mvc_db')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('Lỗi kết nối:', err));


const isAuth = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};


app.post("/api/users", async (req, res) => {
    try {
        const { username, password, fullName } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.json({ message: "Username already exists" });

        
        const user = new User({ username, password, fullName });
        await user.save();
        res.json(user);
    } catch (err) {
        res.json({ error: err.message });
    }
});


app.get("/api/tasks", async (req, res) => {
    const tasks = await Task.find().populate("assignedTo", "username fullName");
    res.json(tasks);
});


app.get("/api/tasks/user/:username", async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.json({ message: "User not found" });

    const tasks = await Task.find({ assignedTo: user._id }).populate("assignedTo");
    res.json(tasks);
});


app.get("/api/tasks/today", async (req, res) => {
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);

    const tasks = await Task.find({
        createdAt: { $gte: start, $lte: end }
    }).populate("assignedTo");
    res.json(tasks);
});


app.get("/api/tasks/not-done", async (req, res) => {
    const tasks = await Task.find({ isDone: false }).populate("assignedTo");
    res.json(tasks);
});


app.get("/api/tasks/lastname/nguyen", async (req, res) => {
    const users = await User.find({ fullName: { $regex: /^Nguyễn/i } });
    const ids = users.map(u => u._id);
    const tasks = await Task.find({ assignedTo: { $in: ids } }).populate("assignedTo");
    res.json(tasks);
});



// Auth
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', authController.postLogin);
app.get('/register', (req, res) => res.render('register'));
app.post('/register', authController.postRegister);
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.redirect('/');
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Tasks (Bảo vệ bởi isAuth)
app.get('/', isAuth, taskController.getIndex);
app.post('/tasks', isAuth, taskController.createTask);
app.post('/tasks/complete/:id', isAuth, taskController.completeTask);
app.get('/tasks/delete/:id', isAuth, taskController.deleteTask);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(` Server chạy tại http://localhost:${PORT}`));