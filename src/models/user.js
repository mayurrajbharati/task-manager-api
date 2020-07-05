const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./../models/task');


const userSchema = new mongoose.Schema({
    name: {
            required: true,
            type: String,
            trim: true,

    },
    age: {
        default: 20,
        type: Number,
        validate(value){
            if(value<18){
                throw new Error('Age must be greater than 18!');
            }
        }
    },
    email: {
        required: true,
        unique: true,
        type: String,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email!');
            }
        }
    },
    password: {
        required: true,
        type: String,
        trim: true,
        minlength: 10,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('The passsword cannot contain "password"');
            }
        }
    },
    avatar:{
        type: String,
    }
},{
    timestamps: true,
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'author'
});

userSchema.methods.toJSON = function(){
    const user = this;
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.__v;
    delete userObj.avatar;
    return userObj;
}
userSchema.methods.generateAuthTokens = async function(){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn : "1d"});
    return token;
}

userSchema.statics.findByCredentials= async (email,password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Invalid login!');
    }    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error("Invalid login");
    }
    return user;
}
userSchema.statics.findbyEmail= async (email)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Invalid login!');
    }
    return user;
}

userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }
    next();
});

userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({author: user._id})
    next();
});

const User = mongoose.model('User',userSchema);

module.exports = User;