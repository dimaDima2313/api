const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    login:    {type: String, required: true, unique: true},
    password: { type: String, required: true},
    role: {type: String, required: true, default: 1}
});

module.exports = mongoose.model('User', userSchema);