const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
require('dotenv')
    .config();
const { User } = require('../models/User');
const { Board } = require('../models/Board');
const secretKey = process.env.SECRET_KEY;
const { deleteImage } = require('./tasksController')

const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        const result = user.toJSON();
        const { password, ...data } = result;
        res.status(200).json({ message: 'success', ...data });
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }

};

const updateUsername = async (req, res) => {
    try {
        const newUsername = req.body.username
        const { username, userId } = req.user;
        const checkUser = await User.findOne({ username: newUsername })
        if (checkUser) {
            res.status(401).json({ message: `User ${newUsername} already exist` });
        }
        await User.updateOne(
            { userId: userId },
            { $set: { username: newUsername } },
        )

        const payload = {
            username: newUsername,
            userId: userId
        };
        const jwt_token = jwt.sign(payload, secretKey);

        res.cookie('jwt', jwt_token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'none',
            secure: true
        });

        res.status(200).json({ message: `${username}'s username was changed to ${req.body.username}`, username: newUsername });
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
};

const updateUserPassword = async (req, res) => {
    try {
        const { username } = req.user;
        const { oldPassword, newPassword } = req.body;
        const salt = await bcryptjs.genSalt(10);
        const user = await User.findOne({ username });
        const passwordCompare = await bcryptjs.compare(String(oldPassword), String(user.password));
        if (!passwordCompare) {
            res.status(400).json({ message: `Old password must be equal to current ${username}'s password` });
            return;
        }
        const newPasswordHash = await bcryptjs.hash(newPassword, salt);
        await User.findOneAndUpdate(
            { username },
            { $set: { password: newPasswordHash } },
        )
        res.status(200).json({ message: `${username}'s password was changed`, password: newPassword });
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const uploadUserAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)

        if (req.file && !user.avatar.includes('default-avatar')) {
            deleteImage(user.avatar)
        }

        await User.updateOne(
            { _id: req.user.userId },
            { $set: { avatar: req.file.path } },
        )
        res.status(200).json({ message: `${req.user.username}'s avatar was changed`, avatar: req.file.path });
    } catch (e) {
        if (req.file) deleteImage(req.file.path)
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.user
        const board = await Board.find({ userId })
        board.forEach(board => {
            board.tasks.forEach(task => {
                if (task.image) {
                    deleteImage(task.image)
                }
            })
        })
        await Board.deleteMany({ userId: { $in: userId } })

        const user = await User.findById(req.user.userId)
        if (!user.avatar.includes('default-avatar')) {
            deleteImage(user.avatar)
        }
        await User.findByIdAndDelete(req.user.userId)
        res.cookie('jwt', '', {
            maxAge: 0,
            sameSite: 'none',
            secure: true
        });
        res.status(200).json({ message: `User was deleted` });
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

const deleteUserAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        if (!user.avatar.includes('default-avatar')) {
            deleteImage(user.avatar)
            await User.findByIdAndUpdate(
                req.user.userId,
                { $set: { avatar: 'img\\default-avatar.png' } },
            )
            res.status(200).json({ message: 'Avatar was deleted successfully' })
            return
        }
        res.status(400).json({ message: 'You cant delete default avatar' })
    } catch (e) {
        res.status(400)
            .send({
                message: 'error',
                error: e.message
            });
    }
}

module.exports = {
    getUserInfo,
    updateUsername,
    updateUserPassword,
    uploadUserAvatar,
    deleteUserAvatar,
    deleteUser
};