const mongoose = require('mongoose');
const { Task } = require('./Task');

const boardSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    description: {
        type: String,
        default: 'none',
    },
    tasks_count: {
        todo: { type: Number, default: 0 },
        progress: { type: Number, default: 0 },
        done: { type: Number, default: 0 }
    },
    color: {
        type: String,
        default: "#6356E5"
    },
    column_color: {
        todo: { type: String, default: "#242948" },
        progress: { type: String, default: "#242948" },
        done: { type: String, default: "#242948" }
    },
    tasks: [{
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: 'none',
        },
        status: {
            type: String,
            require: true,
            default: 'TODO',
            enum: ['TODO', 'PROGRESS', 'DONE', 'ARCHIVED']
        },
        image: {
            type: String,
        },
        isArchived: {
            type: Boolean,
            require: true,
            default: false
        },
        createdAt: {
            type: Date,
            default: new Date()
        },
        color: {
            type: String,
            default: "npm"
        },
        boardId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        comments: [{
            text: {
                type: String,
                require: true
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            createdAt: {
                type: Date,
                default: new Date()
            },
            isEdited: {
                type: Boolean,
                default: false
            }
        }]
    }]
}, { timestamps: true });

const Board = mongoose.model('Board', boardSchema);

module.exports = {
    Board,
};