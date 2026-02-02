import express from "express"
import {startWorkflow, getTaskController, getApprovalController, completeTaskController} from "./task.controller.js"
import auth from '../../middlewares/auth.middleware.js'
import requirerole from "../../middlewares/role.middleware.js"

const router = express.Router();


router.post("/workflow/:workflowId/start", 
     
    auth,
    requirerole(["ADMIN","MANAGER"]),
    startWorkflow
);

router.get("/tasks",
    auth,
    getTaskController
);
router.get("/approvals",
    auth,
    getApprovalController
);

router.post("/tasks/:id/complete",
    auth,
    completeTaskController
);


export default router;

