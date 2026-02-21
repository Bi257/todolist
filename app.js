require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const taskController = require('./controllers/taskController');
const authController = require('./controllers/authController');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Session cấu hình để lưu trạng thái đăng nhập
app.use(session({
    secret: 'todo_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_mvc_db')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('Lỗi kết nối:', err));

// Middleware kiểm tra đăng nhập
const isAuth = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};

// --- ROUTES ---

// Auth
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', authController.postLogin);
app.get('/register', (req, res) => res.render('register'));
app.post('/register', authController.postRegister);
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Xóa cookie phiên làm việc
        res.redirect('/login');
    });
});

// Tasks (Bảo vệ bởi isAuth)
app.get('/', isAuth, taskController.getIndex);
app.post('/tasks', isAuth, taskController.createTask);
app.post('/tasks/complete/:id', isAuth, taskController.completeTask);
app.get('/tasks/delete/:id', isAuth, taskController.deleteTask);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));