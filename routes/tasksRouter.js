const express = require('express');

const router = express.Router();
const { createTask, getTask, deleteTask, updateTask, removeTaskImage, addCommentTask, deleteCommentTask, updateCommentTask } = require('../controllers/tasksController');
const { upload } = require('../middleware/upload')
const url = '/:boardId/tasks'

router.post(`${url}/`, upload.single('image'), createTask);
router.get(`${url}/:id`, getTask);
router.delete(`${url}/:id`, deleteTask);
router.patch(`${url}/:id`, upload.single('image'), updateTask);
router.delete(`${url}/:id/img`, removeTaskImage);
router.post(`${url}/:id/comment`, addCommentTask);
router.delete(`${url}/:taskId/comment/:id`, deleteCommentTask);
router.patch(`${url}/:taskId/comment/:id`, updateCommentTask);

module.exports = {
    tasksRouter: router,
};