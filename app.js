const express = require('express')
const app = express()
const cors = require('cors')
const session = require('express-session')

const indexRouter = require('./routers/index');

app.use(express.json());

app.use(
  session({
    secret: 'JANDI',
    resave: false,
    saveUninitialized: true
  })
);

app.use(express.json());

app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  })
);

app.use('/', indexRouter);
app.listen(3000)

module.exports = app;
