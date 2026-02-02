import * as orgservice from './org.service.js'

export const inviteusercontroller = async (req,res,next) => {

    try{

        const result = await orgservice.invitehim({
            inviter:req.user,
            ...req.body
        })

        res.status(201).json({result});
    }
    catch(err){
        next(err);
    }

}