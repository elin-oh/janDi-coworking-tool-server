<<<<<<< HEAD
const express = require('express')
const app = express()
const cors = require('cors');
require("./models");

const port = 3000

const mainController = require("./controller");

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


app.post("/login", mainController.signInController);



// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })
=======
const express = require('express');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

module.exports = app;
>>>>>>> 8590394ed187adec0a0e6b96823128d4dba42e3b
