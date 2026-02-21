const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getRegister = (req, res) => res.render('register');
exports.getLogin = (req, res) => res.render('login', { error: null });

exports.postRegister = async (req, res) => {
    try {
        const { username, password, fullName, role } = req.body;
        // Check username tồn tại 
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.send("Username đã tồn tại!");

        await User.create({ username, password, fullName, role });
        res.redirect('/login');
    } catch (err) { res.status(500).send(err.message); }
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user; // Lưu thông tin vào session
        return res.redirect('/');
    }
    res.render('login', { error: "Sai tài khoản hoặc mật khẩu!" });
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};