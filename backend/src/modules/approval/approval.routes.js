import express from "express"
import auth from '../../middlewares/auth.middleware.js'
import requirerole from "../../middlewares/role.middleware.js"
import {approveTask,rejectTask} from "./approval.controller.js"


const router = express.Router();


router.post("/:approvalId/accept",
    auth,
    requirerole(["ADMIN","MANAGER"]),
    approveTask
)

router.post("/:approvalId/reject",
    auth,
    requirerole(["ADMIN","MANAGER"]),
    rejectTask
)



export default router;

