const jwt = require('jsonwebtoken');

const authMiddleware = (req,res,next) => {
    const authtoken = req.cookies?.auth_token;

    if(!authtoken){
        return responseHandler.response(res,401,"Unauthorized or token is missing",null);
    }
    try{
        const decodedToken = jwt.verify(authtoken,process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    }catch(error){
        console.log(error);
        return responseHandler.response(res,500,"internal server error",null);
    }


}
module.exports = authMiddleware;