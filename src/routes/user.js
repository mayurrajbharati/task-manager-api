const express = require('express');
const User = require('./../models/user');
const router = new express.Router();
const {welcomeEmail,cancelEmail,forgotPass} = require('./../emails/account');
const cookieParser= require('cookie-parser');
const auth = require('./../middleware/auth');
const multer = require('multer');
const generator = require('generate-password');

const storage = multer.diskStorage({
    destination: './uploads',
    filename: function(req,file,cb){
        cb(null,file.originalname);
    }
})
const upload = multer({storage},{
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please provide an image!'));
        }
        cb(undefined, true);
    }
})

router.use(cookieParser());

router.post('/users', async (req,res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        welcomeEmail(user.email, user.name);
        res.status(201).send(user);
    }catch(e){
        res.status(400).send(e.message);
    }    
})

router.post('/users/login', async (req,res)=>{
    try{
            const user = await User.findByCredentials(req.body.email, req.body.password);
            const token = await user.generateAuthTokens();
            res.cookie('authorization',token,{ maxAge: 24*60*60*1000,httpOnly: true}).send(`Hi ${user.name}, you are successfully logged in!`);
    }catch(e){
            res.status(400).send(e.message);
    }
});

router.post('/users/logout',async (req,res)=>{
    try{
        res.clearCookie('authorization').send({success: true});
    }catch(e){
        res.status(500).send(e);
    }
})

router.get('/users/me', auth, async (req,res)=>{
     res.send(req.user);
})


router.patch('/users/me/update', auth, async (req,res)=>{
    const allowedUpdates = ['name','email','age'];
    const updates = Object.keys(req.body);
    const isValid = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValid){
        return res.status(400).send({error: 'Invalid updates'});
    }
    try{
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save();
        res.send(req.user);
    }catch(e){
        res.status(400).send(e);
    }
})


router.patch('/users/me/updatePass', auth, async (req,res)=>{
    const allowedUpdates = ['password'];
    const updates = Object.keys(req.body);
    const isValid = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValid){
        return res.status(400).send({error: 'Invalid updates'});
    }
    try{
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save();
        res.send(req.user);
    }catch(e){
        res.status(400).send(e);
    }
})

router.delete('/users/me',auth, async (req,res)=>{
    try{
        await req.user.remove();
        cancelEmail(req.user.email,req.user.name);
        res.clearCookie('authorization').send('User successfully removed!');
        
    }catch(e){
            res.status(500).send(e);
    }
})

router.post('/users/me/avatars', auth , upload.single('avatar'), async (req,res)=>{
    const imgFile = req.file.filename;
    req.user.avatar = imgFile;
    await req.user.save();
    //const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    // req.user.avatar = req.file.buffer;
    // await req.user.save();
    console.log(req.user.avatar);
    res.send(req.file);
},(error, req, res, next)=>{
    res.status(400).send({
        error: error.message,
    })
})

router.delete('/users/me/avatars', auth, async(req,res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

router.get('/users/:id/avatar', async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);

        if(!user || ! user.avatar){
            throw new Error();
        }

        res.set('Content-Type','image/png');
        res.send(user.avatar)
    }catch(e){
        res.status(500).send(e);
    }
})

router.post('/users/forgot', async(req,res)=>{
    try{
        const user = await User.findbyEmail(req.body.email);
        const password = generator.generate({
            length: 10,
            numbers: true
        });
        user.password = password;
        forgotPass(user.email,user.name,password);
        await user.save();
        res.send('Your password has been reset. Please check your mail!');
    }catch(e){
        res.status(400).send(e);
    }
})

module.exports = router;