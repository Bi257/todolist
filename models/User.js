const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'normal'], default: 'normal' }
});

// Băm mật khẩu tự động
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return ;
    this.password = await bcrypt.hash(this.password, 10);
    ;
});

module.exports = mongoose.model('User', userSchema);