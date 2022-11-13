const express = require('express');

const router = express.Router();
const { registerUser, loginUser, loginUserPostman, getAuth, logout, logoutP } = require('../controllers/authContoller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/loginp', loginUserPostman);
router.get('/check', getAuth);
router.get('/logout', logout);
router.get('/logoutp', logoutP);

module.exports = {
  authRouter: router,
};
