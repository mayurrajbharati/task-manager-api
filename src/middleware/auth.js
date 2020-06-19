const jwt = require('jsonwebtoken');
const User = require('./../models/user');
const auth = async (req,res,next)=>{
    try{
        const token = req.cookies.authorization;
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findOne({_id: decoded._id});
        if(!user){
             throw new Error();
         }
         req.user = user;
         req.token = token;
         next();
    }catch(e){
        res.clearCookie("authorization");
        res.status(400).send(e.message);
    };
}

module.exports = auth;