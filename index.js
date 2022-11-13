const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 8080
const username = process.env.username
const passowrd = process.env.password
const address = process.env.address

const app = express();
const url = `mongodb+srv://${username}:${passowrd}@${address}/taskControllerProject?retryWrites=true&w=majority`;

mongoose.connect(url);

const { authRouter } = require('./routes/authRouter');
const { usersRouter } = require('./routes/userRouter');
const { boardsRouter } = require('./routes/boardsRouter');
const { tasksRouter } = require('./routes/tasksRouter');
const { authMiddleware } = require('./middleware/authMiddleware');

app.use(cors({
  credentials: true,
  origin: ['http://localhost:4200', 'http://127.0.0.1:5500', 'http://localhost:64451', 'https://yurakovlachuk.github.io', 'https://enigmatic-shelf-18044.herokuapp.com'],
}));

app.use(cookieParser());

app.use(express.json());
app.use(morgan('tiny'));
app.use('/img', express.static('img'))

app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/boards', authMiddleware, boardsRouter);
app.use('/api/auth', authRouter);
app.use('/api/board', authMiddleware, tasksRouter);

const start = async () => {
  app.listen(PORT, () => console.log('Server started listening on pc'));
};

start();

// // ERROR HANDLER
// function errorHandler(err, req, res) {
//   console.error(err);
//   res.status(500).send({ message: 'Server error' });
// }

// app.use(errorHandler);
