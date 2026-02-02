import * as workflowService from './workflow.service.js'

export const workflowController = async (req,res,next) => {

    try{
         
    console.log("REQ.BODY.NODES =", req.body?.nodes);
        const result = await workflowService.createWorkflow({
            orgId: req.user.orgId,
            userId: req.user.userId,
            ...req.body
        })

        res.status(201).json({result});
    }
    catch(err){
        next(err);
    }


}

export const getWorkflowsController = async(req , res , next) => {
    try{
        const workflows = await workflowService.getWorkflows({
            orgId:req.user.orgId,
            userId:req.user.userId,
        });

        res.json(workflows);
    }catch(err){
        next(err);
    }
}

export const getWorkflowByIdController = async(req , res , next) => {
    try{
        const workflow = await workflowService.getWorkflowById({
            workflowId:req.params.id,
            orgId:req.user.orgId,
        });

        return res.json(workflow);
    }catch(err){
        next(err);
    }
}
