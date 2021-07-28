// external imports
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const cors = require('cors');
const cookiePraser = require('cookie-parser');
const mongoose = require('mongoose');

// internal imports
const authRoute = require('./routes/authRoute');
const inboxRoute = require('./routes/inboxRoute');
const errorHandler = require('./middleware/errorHandler');

// initialize app
const app = express();
const server = http.createServer(app);
dotenv.config();

// socket creation
// eslint-disable-next-line import/order
const io = require('socket.io')(server);

global.io = io;

// connect to db
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

// body and cookie parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiePraser());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// prevent cors issue
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

// mount routes
app.use('/auth', authRoute);
app.use('/inbox', inboxRoute);

// handle errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`app is running on port: ${PORT}`);
});

// process.on('unhandledRejection', (err) => {
//     console.log(`Error: ${err.message}`);
//     // close server and exit process
//     app.close(() => process.exit(1));
// });
