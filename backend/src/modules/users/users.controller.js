
import * as orgUsersService from "./users.service.js"

export const getOrgUsersController = async (req, res, next) => {

  try{
        const orgUsers = await orgUsersService.getOrgUsers(req.user.orgId);
        
        return res.json(orgUsers);
    }catch(err){
        next(err);
    }
  
};

export const getOrgNameController = async (req, res, next) => {

  try{
        const orgName = await orgUsersService.getOrgName(req.user.orgId);
        
        return res.status(200).json({
            orgName: orgName,
        });
    }catch(err){
        next(err);
    }
  
};