const express = require('express')
const app = express()
const cors = require('cors')
const port = 3000

const indexRouter = require('./routes/index');

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

module.exports = app;
