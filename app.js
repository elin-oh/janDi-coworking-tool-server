const express = require('express')
const app = express()
const cors = require('cors')
const session = require('express-session')
const fs = require('fs')
var http = require('http');
var https = require('https');
var certificate = fs.readFileSync('ssl/mykey.pem', 'utf8')
var privateKey = fs.readFileSync('ssl/mykey-key.pem', 'utf8')
const indexRouter = require('./routers/index');
var credentials = { privateKey: privateKey, cert: certificate };

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
    origin: ['http://jandi-client.s3-website.ap-northeast-2.amazonaws.com'],
    methods: ['GET,POST,PUT,DELETE'],
    credentials: true
  })
);
app.options('*', cors())
app.use('/', indexRouter);
// httpServer.listen(4000);
// httpsServer.listen(3000);
app.listen(3000)

module.exports = app;
