const { Board } = require('../models/Board');
const mongoose = require('mongoose');
const fs = require('fs')

const deleteImage = (path) => {
    fs.unlinkSync(path, function (err) {
        if (err && err.code == 'ENOENT') {
            console.info("File doesn't exist, won't remove it.");
            return
        } else if (err) {
            console.error("Error occurred while trying to remove file");
        } else {
            console.info(`removed`);
        }
    });
}

const statusCountByBoardId = async (boardId) => {
    const board = await Board.findOne({ _id: boardId });
    let todoCount = 0;
    let progressCount = 0;
    let doneCount = 0;
    board.tasks.forEach(item => {
        if (item.status === 'TODO' && !item.isArchived) { todoCount++; }
        if (item.status === 'PROGRESS' && !item.isArchived) { progressCount++; }
        if (item.status === 'DONE' && !item.isArchived) { doneCount++; }
    });
    await Board.updateOne({ _id: boardId }, {
        $set: {
            tasks_count: {
                todo: todoCount,
                progress: progressCount,
                done: doneCount
            }
        }
    })
}

const createTask = async (req, res) => {
    const { name, description, status, isArchived } = req.body;
    const taskId = new mongoose.Types.ObjectId()
    try {
        const checkBoard = await Board.findOne({ _id: req.params.boardId });
        if (!checkBoard) {
            return res.status(404).json({ message: `Wrong with this id not exists` });
        }
        // const checkTask = await Board.findOne({ _id: req.params.boardId, })
        //     .select({ tasks: { $elemMatch: { name } } });
        // if (checkTask.tasks[0]) {
        //     return res.status(404).json({ message: `Task with name: "${name}" already exists` });
        // }
        const task = { name, description, status, isArchived, boardId: req.params.boardId, comments: [] };
        task.createdAt = new Date()

        // await addTaskCountByStatus(status, req.params.boardId, 1)

        if (req.file) {
            task.image = req.file.path
        }
        await Board.updateOne({ _id: req.params.boardId }, { $push: { tasks: { ...task, _id: taskId } } })

        statusCountByBoardId(req.params.boardId)

        // const taskId = await Board.findOne({
        //     _id: req.params.boardId,
        // }).select({ tasks: { $elemMatch: { name } } });
        // const findedTask = taskId.tasks[0];

        task._id = taskId

        res.status(200).send({ message: 'success', ...task });
    } catch (e) {
        if (req.file) {
            deleteImage(req.file.path)
            await Board.updateOne(
                { 'tasks._id': taskId },
                { '$set': { 'tasks.$.image': '' } })
        }
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const getTask = async (req, res) => {
    try {
        const task = await Board.findOne({
            _id: req.params.boardId,
        }).select({ tasks: { $elemMatch: { _id: req.params.id } } });
        const findedTask = task.tasks[0];
        if (!findedTask) {
            return res.status(404).json({ message: `Task not found` });
        }
        res.status(200).json(findedTask);
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const deleteTask = async (req, res) => {
    try {
        const { boardId, id } = req.params

        const task = await Board.findOne({
            _id: req.params.boardId,
        }).select({ tasks: { $elemMatch: { _id: id } } });
        const findedTask = task.tasks[0];

        // await addTaskCountByStatus(findedTask.status, boardId, -1)

        if (findedTask.image && fs.existsSync(findedTask.image)) {
            deleteImage(findedTask.image)
        }

        await Board.findOneAndUpdate(
            { _id: boardId },
            { $pull: { tasks: { _id: id } } },
            { safe: true }
        );

        statusCountByBoardId(boardId)
        return res.status(200).json({ message: "Task deleted successfully" });
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const updateTask = async (req, res) => {
    try {
        const { name, description, status, isArchived } = req.body;
        const task = await Board.findOne({
            _id: req.params.boardId,
        }).select({ tasks: { $elemMatch: { _id: req.params.id } } });
        const findedTask = task.tasks[0];
        if (req.file && findedTask.image && fs.existsSync(findedTask.image)) {
            deleteImage(findedTask.image)
        }

        // if (isArchived) {
        //     await addTaskCountByStatus(findedTask.status, req.params.boardId, -1)
        // } else if (isArchived === false) {
        //     await addTaskCountByStatus(findedTask.status, req.params.boardId, 1)
        // }

        // if (status) {
        //     await addTaskCountByStatus(findedTask.status, req.params.boardId, -1)
        //     await addTaskCountByStatus(status, req.params.boardId, 1)
        // }

        await Board.updateOne(
            { 'tasks._id': req.params.id },
            {
                '$set': {
                    'tasks.$.name': name,
                    'tasks.$.description': description,
                    'tasks.$.status': status,
                    'tasks.$.isArchived': isArchived,
                }
            }, { runValidators: true })

        if (req.file) {
            await Board.updateOne(
                { 'tasks._id': req.params.id },
                { '$set': { 'tasks.$.image': req.file.path } })
        }

        const editedTask = await Board.findOne({
            _id: req.params.boardId,
        }).select({ tasks: { $elemMatch: { _id: req.params.id } } });
        const result = editedTask.tasks[0];

        if (status) { statusCountByBoardId(req.params.boardId) }

        res.status(200).json({ message: 'success', result })
    } catch (e) {
        if (req.file) {
            deleteImage(req.file.path)
            await Board.updateOne(
                { 'tasks._id': req.params.id },
                { '$set': { 'tasks.$.image': '' } })
        }
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const removeTaskImage = async (req, res) => {
    try {
        const task = await Board.findOne({
            _id: req.params.boardId,
        }).select({ tasks: { $elemMatch: { _id: req.params.id } } });
        const findedTask = task.tasks[0];
        if (findedTask.image && fs.existsSync(findedTask.image)) {
            deleteImage(findedTask.image)
            await Board.updateOne(
                { 'tasks._id': req.params.id },
                { '$set': { 'tasks.$.image': '' } })
            return res.status(200).json({ message: 'Image deleted successfully' })
        }
        return res.status(400).json({ message: 'No image to delete' })
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const addCommentTask = async (req, res) => {
    try {
        const { boardId, id } = req.params
        const { text } = req.body
        const comment = { text, userId: req.user.userId, createdAt: new Date() }
        const commentId = new mongoose.Types.ObjectId()

        const checkTask = await Board.findOne({ _id: req.params.boardId, })
            .select({ tasks: { $elemMatch: { _id: id } } });
        if (!checkTask.tasks[0]) {
            return res.status(404).json({ message: `Wrong id task` });
        }

        // await Board.updateOne({ _id: boardId, "tasks._id": id }, { $push: { 'tasks.$.comments': comment } })

        await Board.updateOne({ _id: boardId, "tasks._id": id }, { $push: { 'tasks.$.comments': { ...comment, _id: commentId } } })
        // const findedTask = board.tasks.find(task => task._id.toString() === id)
        // const findedComment = findedTask.comments.find(comment => comment._id.toString() === commentId)

        // comment._id = findedComment._id

        comment._id = commentId

        return res.status(200).json({ ...comment })
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const deleteCommentTask = async (req, res) => {
    try {
        const { boardId, taskId, id } = req.params
        const checkTask = await Board.findOne({ _id: boardId, })
            .select({ tasks: { $elemMatch: { _id: taskId } } });
        const task = checkTask.tasks[0];

        const findedComment = task.comments.find(comment => comment._id.toString() === id)

        if (!findedComment) {
            return res.status(404).json({ message: "Wrong Id comment" });
        }

        const deletedCommentArray = task.comments.filter(comment => comment._id.toString() !== id)

        await Board.updateOne(
            { 'tasks._id': taskId },
            { '$set': { 'tasks.$.comments': deletedCommentArray } })


        return res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const updateCommentTask = async (req, res) => {
    try {
        const { text } = req.body
        const { boardId, taskId, id } = req.params
        const task = await Board.findOne({
            _id: boardId,
        }).select({ tasks: { $elemMatch: { _id: taskId } } });
        const check = task.tasks[0];

        if (!check) {
            return res.status(404).json({ message: `Wrong id task` });
        }

        let comments = check.comments

        comments.find((comment, i) => {
            if (comment._id.toString() === id) {
                let findedComment = {
                    userId: req.user.userId,
                    _id: comment._id,
                    createdAt: comment.createdAt,
                    text,
                    isEdited: true
                }
                comments[i] = findedComment
                return true
            }
            return false
        })

        const board = await Board.findOneAndUpdate(
            { 'tasks._id': taskId },
            { '$set': { 'tasks.$.comments': comments } }, { new: true })


        const findedTask = board.tasks.find(task => task._id.toString() === taskId)
        const result = findedTask.comments.find(comment => comment._id.toString() === id)

        res.status(200).json({ message: 'success', result })
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

module.exports = {
    createTask,
    getTask,
    deleteTask,
    updateTask,
    deleteImage,
    removeTaskImage,
    addCommentTask,
    deleteCommentTask,
    updateCommentTask
};