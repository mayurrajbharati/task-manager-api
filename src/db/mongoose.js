const mongoose = require('mongoose');

mongoose.connect(process.env.URL,{
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});