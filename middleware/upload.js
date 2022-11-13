const multer = require('multer');
const path = require('path');
const fs = require('fs')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer(
    {
        storage,
        fileFilter: function (req, file, callback) {
            if (
                file.mimetype == 'image/png' ||
                file.mimetype == 'image/jpg' ||
                file.mimetype == 'image/jpeg' ||
                file.mimetype == 'image/gif'
            ) {
                callback(null, true);
            } else {
                console.log('jpg & png only!');
                callback(null, false);
            }
        },
        limits: {
            fileSize: 1024 * 1024 * 4
        },
    })

module.exports = {
    upload
};