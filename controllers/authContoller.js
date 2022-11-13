const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
require('dotenv')
  .config();
const { User } = require('../models/User');
const secretKey = process.env.SECRET_KEY;

const registerUser = async (req, res, next) => {
  try {
    const checkUser = await User.findOne({ username: req.body.username });
    if (checkUser) {
      return res.status(404)
        .json({
          message: `User ${req.body.username} already exists`
        });
    }
    const salt = await bcryptjs.genSalt(10);
    const newUser = new User({
      username: req.body.username,
      password: await bcryptjs.hash(req.body.password, salt),
    });
    const saveResult = await newUser.save();
    const {
      password,
      ...data
    } = saveResult.toJSON();
    res.status(200)
      .send(data);
  } catch (e) {
    res.status(400)
      .send({
        message: 'error',
        error: e.message
      });
  }
};

const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404)
        .json({
          message: `Account "${req.body.username}" does not exist`
        });
    }
    if (!await bcryptjs.compare(String(req.body.password), String(user.password))) {
      return res.status(404)
        .json({ message: 'Wrong password' });
    }

    const payload = {
      username: user.username,
      userId: user._id
    };
    const jwt_token = jwt.sign(payload, secretKey);

    res.cookie('jwt', jwt_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'none',
      secure: true
    });

    const userData = user.toJSON()
    const { password, ...data } = userData
    return res.status(200)
      .json({
        message: 'success',
        ...data
      });
  }
  catch (e) {
    res.status(400)
      .send({
        message: 'error',
        error: e.message
      });
  }
};


const loginUserPostman = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404)
        .json({
          message: `Account "${req.body.username}" does not exist`
        });
    }
    if (!await bcryptjs.compare(String(req.body.password), String(user.password))) {
      return res.status(404)
        .json({ message: 'Wrong password' });
    }

    const payload = {
      username: user.username,
      userId: user._id
    };
    const jwt_token = jwt.sign(payload, secretKey);

    res.cookie('jwt', jwt_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.status(200)
      .json({
        message: 'success',
        ...user,
        jwt_token
      });
  }
  catch (e) {
    res.status(400)
      .send({
        message: 'error',
        error: e.message
      });
  }
};

const getAuth = async (req, res) => {
  try {
    const cookie = req.cookies['jwt'];
    const claims = jwt.verify(cookie, secretKey);
    if (!claims) {
      return res.status(401).send({ message: 'Unauthenticated' });
    }
    const user = await User.findOne({ _id: claims.userId })
    const { password, ...data } = user.toJSON();
    return res.status(200).send(data);
  } catch {
    return res.status(401).send({ message: 'Unauthenticated' });
  }
}

const logout = (req, res) => {
  res.cookie('jwt', '', {
    maxAge: 0,
    sameSite: 'none',
    secure: true
  });
  res.status(200).send({ message: 'Success' });
}

const logoutP = (req, res) => {
  res.cookie('jwt', '', {
    maxAge: 0
  });
  res.status(200).send({ message: 'Success' });
}


module.exports = {
  registerUser,
  loginUser,
  loginUserPostman,
  getAuth,
  logout,
  logoutP
};
