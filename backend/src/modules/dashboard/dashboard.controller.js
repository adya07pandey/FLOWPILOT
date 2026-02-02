import { getDashboardStats } from "./dashboard.service.js";


export const dashboardController = async (req, res, next) => {

    try{
        

        const result = await getDashboardStats({
            orgId:req.user.orgId,
        })
        
        res.status(200).json(result);
    }
    catch(err){
        next(err);
    }
};

