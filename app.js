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