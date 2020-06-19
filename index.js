const express = require('express');
require('./src/db/mongoose.js');
const cookieParser = require('cookie-parser');
//const cors = require('cors');
const userRouter = require('./src/routes/user');
const taskRouter = require('./src/routes/task');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
app.use(cookieParser());
//app.use(cors({ credentials: true, origin: process.env.FRONT_END_URL}));


const port = process.env.PORT;

app.listen(port,()=>{
    console.log('Server is up on port: '+ port);
})
