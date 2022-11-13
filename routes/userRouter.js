const express = require('express');

const router = express.Router();
const { getUserInfo, updateUsername, updateUserPassword, uploadUserAvatar, deleteUserAvatar, deleteUser } = require('../controllers/usersController');
const { upload } = require('../middleware/upload')

router.get('/me', getUserInfo)
router.patch('/me/username', updateUsername);
router.patch('/me/password', updateUserPassword);
router.patch('/me/upload', upload.single('avatar'), uploadUserAvatar);
router.delete('/me/avatar', deleteUserAvatar)
router.delete('/me', deleteUser)

module.exports = {
    usersRouter: router,
};