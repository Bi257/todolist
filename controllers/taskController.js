const Task = require('../models/Task');
const User = require('../models/User');

exports.getIndex = async (req, res) => {
    try {
        const currentUser = req.session.user;
        const allUsers = await User.find();
        
        // Lấy tất cả task kèm thông tin user (getAllTasks - Level 1)
        const tasks = await Task.find().populate('assignedTo completedBy').sort({ createdAt: -1 });

        // Logic lọc Level 1
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const stats = {
            today: await Task.countDocuments({ createdAt: { $gte: todayStart } }),
            pending: await Task.countDocuments({ isDone: false }),
            // Lọc task có người thực hiện họ 'Nguyễn'
            nguyenTasks: await Task.find().populate({
                path: 'assignedTo',
                match: { fullName: /^Nguyễn/i }
            }).then(ts => ts.filter(t => t.assignedTo.length > 0).length)
        };

        res.render('index', { tasks, users: allUsers, currentUser, stats });
    } catch (err) {
        res.status(500).send("Lỗi hệ thống: " + err.message);
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, assignId } = req.body;
        const currentUser = req.session.user;

        // Level 3: Admin có thể chọn nhiều người, Normal chỉ tự giao chính mình
        let assignedTo = [currentUser._id];
        if (currentUser.role === 'admin' && assignId) {
            assignedTo = Array.isArray(assignId) ? assignId : [assignId];
        }

        await Task.create({ title, assignedTo });
        res.redirect('/');
    } catch (err) { res.redirect('/'); }
};

exports.completeTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        const userId = req.session.user._id;

        // Thêm vào danh sách người đã click "xong"
        if (!task.completedBy.some(id => id.toString() === userId.toString())) {
            task.completedBy.push(userId);
        }

        // Level 3: Task chỉ hoàn thành khi tất cả người được giao đã click xong
        if (task.completedBy.length >= task.assignedTo.length) {
            task.isDone = true;
            task.doneAt = new Date();
        }

        await task.save();
        res.redirect('/');
    } catch (err) { res.redirect('/'); }
};

exports.deleteTask = async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/');
};