import jwt from "jsonwebtoken"

const auth = (req,res,next) => {
    try{

        const authheader = req.headers.authorization;

        let token;
        // check header and token
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
            token = req.headers.authorization.split(" ")[1]

        }
        else if(req.cookies?.jwt){
            token = req.cookies.jwt;
        }

        if(!token){
            throw new Error("Authorization header missing")
        }

        //verify token
        const payload = jwt.verify(token,process.env.JWT_SECRET)
        
        //user credentials
        req.user={
            userId:payload.userId,
            orgId:payload.orgId,
            role:payload.role,
        };
        
        next();
    }
    catch(err){
        next(err);
    }
}

export default auth;