const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    // Level 3: Mảng người được giao và người đã hoàn thành
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDone: { type: Boolean, default: false },
    doneAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);