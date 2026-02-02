import * as taskService from "./task.service.js"

export const startWorkflow = async (req,res,next) => {

    try{

        const result = await taskService.startWorkflow({
            workflowId:req.params.workflowId,
            orgId: req.user.orgId,
            startedBy:req.user.userId
        });

        res.status(201).json(result);

    }
    catch(err){
        next(err);
    }

};

export const getTaskController  = async (req , res , next) => {

    
    try{
        const result = await taskService.getTasks({
            userId:req.user.userId,
            orgId:req.user.orgId,
        });

        res.status(201).json(result);
    }catch(err){
        next(err);
    }
}

export const getApprovalController  = async (req , res , next) => {
   
    try{
        const result = await taskService.getApprovals({
            userId:req.user.userId,
            orgId:req.user.orgId,
        });
        
        res.status(201).json(result);
    }catch(err){
        next(err);
    }
}

export const completeTaskController = async (req , res , next) => {
    try{
        const result = await taskService.completeTask({
            taskId:req.params.id,
        })
        res.status(200).json(result);
    }catch(err){
        next(err);
    }
}

