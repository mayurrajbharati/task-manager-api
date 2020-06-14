const express = require('express');
require('./src/db/mongoose.js');
const userRouter = require('./src/routes/user');
const taskRouter = require('./src/routes/task');

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


const port = process.env.PORT;

app.listen(port,()=>{
    console.log('Server is up on port: '+ port);
})
