const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: 'none',
    },
    status: {
        type: String,
        require: true,
        default: 'TODO',
        enum: ['TODO', 'PROGRESS', 'DONE']
    },
    imgSrc: {
        type: String,
    },
    isArchived: {
        type: Boolean,
        require: true,
        default: false
    },
    comments: [{
        text: {
            type: String,
            require: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        }
    }]

}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = {
    Task,
};