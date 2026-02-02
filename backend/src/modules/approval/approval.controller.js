import * as approvalService from "./approval.service.js"
import * as taskService from "../tasks/task.service.js"
export const approveTask = async (req, res, next) => {

    try{
        const result = await approvalService.approveTask({
            approvalId: req.params.approvalId,
            userId:req.user.userId
        })
        
        res.status(200).json(result);
    }
    catch(err){
        next(err);
    }
};

export const rejectTask = async (req, res, next) => {

    try{
        
        const result = await approvalService.rejectTask({
            approvalId: req.params.approvalId,
            userId:req.user.userId
        })
        
        res.status(200).json(result);
    }
    catch(err){
        next(err);
    }
};

