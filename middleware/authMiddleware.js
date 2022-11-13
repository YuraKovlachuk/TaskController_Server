const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {
    const cookie = req.cookies['jwt'];
    if (!cookie) {
      return res.status(401).json({ message: 'Cookie is missing' });
    }
    const tokenKey = process.env.SECRET_KEY;
    const tokenPayload = jwt.verify(cookie, tokenKey);
    if (!tokenPayload) {
      return res.status(401).send({ message: 'Unauthenticated' });
    }
    req.user = {
      userId: tokenPayload.userId,
      username: tokenPayload.username,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};

module.exports = {
  authMiddleware,
};
