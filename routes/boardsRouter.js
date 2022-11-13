const express = require('express');

const router = express.Router();
const { createBoard, getBoards, getBoard, deleteBoard, updateBoardById } = require('../controllers/boardsController');

router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.delete('/:id', deleteBoard);
router.patch('/:id', updateBoardById);

module.exports = {
    boardsRouter: router,
};
