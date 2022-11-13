const { Board } = require('../models/Board');
const { deleteImage } = require('./tasksController')

const createBoard = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const checkBoard = await Board.findOne({ name });
        if (checkBoard) {
            return res.status(404)
                .json({
                    message: `Board with name: "${name}" already exists`
                });
        }

        const board = new Board({
            name,
            userId: req.user.userId,
            description,
            color
        });

        const newBoard = await board.save()
        const data = newBoard.toJSON()
        res.status(200)
            .json({
                message: 'success',
                ...data,
            });
    } catch (e) {

        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const getBoards = async (req, res) => {
    Board.find({ userId: req.user.userId }, '-__v')
        .skip(req.query.offset)
        .limit(req.query.limit)
        .then((result) => {
            res.status(200).json({
                offset: req.query.offset,
                limit: req.query.limit,
                count: result.length,
                boards: result,
            });
        })
        .catch((err) => {
            res.status(400).send({ message: `Error: ${err}` });
        });
}

const getBoard = async (req, res) => {
    try {
        const result = await Board.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!result) {
            return res.status(404)
                .json({
                    message: `Board not found`
                });
        }
        const data = result.toJSON()
        res.status(200).json({
            message: 'success',
            ...data
        })
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const deleteBoard = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        board.tasks.forEach(task => {
            if (task.image) {
                deleteImage(task.image)
            }
        })
        const result = await Board.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404)
                .json({
                    message: `Board not found`
                });
        }
        res.status(200).json({
            message: 'Board deleted successfully'
        })
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const updateBoardById = async (req, res) => {
    try {
        const { name, color, column, boardId } = req.body;
        console.log(req.body)
        const checkBoard = await Board.findOne({ name });
        if (checkBoard && checkBoard._id.toString() !== req.params.id) {
            return res.status(404)
                .json({
                    message: `Board with name: "${name}" already exists`
                });
        }
        if (column) {
            const board = await Board.findOne({ _id: boardId });
            const columnColor = board.column_color
            await Board.updateOne({ _id: req.params.id, userId: req.user.userId }, {
                $set: {
                    column_color: {
                        ...columnColor,
                        [column]: color
                    }
                }
            });
        } else {
            await Board.updateOne({ _id: req.params.id, userId: req.user.userId }, { $set: { name, color } });
        }
        res.status(200).json({ message: 'Board was updated' });;
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
};

module.exports = {
    createBoard,
    getBoards,
    getBoard,
    deleteBoard,
    updateBoardById
};