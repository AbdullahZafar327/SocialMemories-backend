import jwt from 'jsonwebtoken'

//click the like button -> auth middleware (next) => like controller
const auth = async (req,res,next) =>{
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            //get token from header
            const token = req.headers.authorization.split(' ')[1];
            //if less then 500 that means token is our , if not it means its google
            const isCustom = token.length < 500;
            if(token && isCustom){
                //verify token
                const decodedData = jwt.verify(token,'secret-key')
                req.userId = decodedData?.id
                next();
            }else{
                //google verification
                const decodedData = jwt.decode(token)
                req.userId = decodedData?.sub;
                next();
            }
        } catch (error) {
            res.status(401).send('Not Authorized')
        }
    }
}

export default auth;