const express = require('express');
const User = require('./../models/user');
const router = new express.Router();
//const {welcomeEmail,cancelEmail,forgotPass} = require('./../emails/account');
const auth = require('./../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const generator = require('generate-password');
const upload = multer({
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

router.post('/users', async (req,res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        //welcomeEmail(user.email, user.name);
        const token = await user.generateAuthTokens();
        res.cookie("token",token,{ httpOnly: true }).status(201).send(user);
    }catch(e){
        res.status(400).send(e.message);
    }    
})

router.post('/users/login', async (req,res)=>{
    try{
            const user = await User.findByCredentials(req.body.email, req.body.password);
            const token = await user.generateAuthTokens();
            res.cookie("token",token,{ httpOnly: true}).send(user);
    }catch(e){
            res.status(400).send(e.message);
    }
});

router.post('/users/logout', auth, async (req,res)=>{
    try{
        //req.user.tokens = req.user.tokens.filter((token)=> token.token !== req.token )
        //await req.user.save();
        res.clearCookie("token").send({success: true});
    }catch(e){
        res.status(500).send(e);
    }
})

// router.post('/users/logoutAll', auth, async (req,res)=>{
//     try{
//         req.user.tokens = [];
//         await req.user.save();
//         res.send();
//     }catch(e){
//         res.status(500).send(e);
//     }
// })
router.get('/users/me', auth, async (req,res)=>{
    res.send(req.user);
})


router.patch('/users/me', auth, async (req,res)=>{
    const allowedUpdates = ['name','password','email','age'];
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
        //cancelEmail(req.user.email,req.user.name);
        res.send(req.user);
    }catch(e){
            res.status(500).send(e);
    }
})

router.post('/users/me/avatars',auth , upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
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

// router.post('/users/forgot', async(req,res)=>{
//     try{
//         const user = await User.findbyEmail(req.body.email);
//         const password = generator.generate({
//             length: 10,
//             numbers: true
//         });
//         user.password = password;
//         forgotPass(user.email,user.name,password);
//         await user.save();
//         res.send(user);
//     }catch(e){
//         res.status(400).send(e);
//     }
// })

module.exports = router;