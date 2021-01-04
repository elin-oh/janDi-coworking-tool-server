const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
var http = require('http');
var https = require('https');
const indexRouter = require('./routers/index');

app.use(express.json());

app.use(
  session({
    secret: 'JANDI',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());

app.use(
  cors({
    origin: ['http://localhost:5000'],
    methods: ['GET,POST,PUT,DELETE'],
    credentials: true,
  })
);

app.options('*', cors());

app.use(express.static(path.join(__dirname, '/public')));
app.use('/login', express.static(path.join(__dirname, '/public')));
app.use('/project', express.static(path.join(__dirname, '/public')));
app.use('/mypage', express.static(path.join(__dirname, '/public')));
app.use('/signup', express.static(path.join(__dirname, '/public')));
app.use('/project/:id', express.static(path.join(__dirname, '/public')));

app.use('/', indexRouter);
app.listen(5000);

module.exports = app;
