const jwt = require('jsonwebtoken');
const User =require('../models/User');
require('dotenv').config();

const authMiddleware = async(req , res , next)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token ==null){
        return res.sendStatus(401);
    }
    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if(!user){
            return res.sendStatus(403);
        }
        req.user = {id :user._id};
        next();
    }catch(err){
        console.log("JWT Verficaation Error:",err.message);
        return res.sendStatus(403);
    }

};
module.exports = authMiddleware;