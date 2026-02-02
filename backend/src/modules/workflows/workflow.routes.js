import express from "express"
import { workflowController,getWorkflowByIdController,getWorkflowsController } from "./workflow.controller.js"
import auth from '../../middlewares/auth.middleware.js'
import requirerole from "../../middlewares/role.middleware.js"

const router = express.Router();

router.post("/", 
    auth,
    requirerole(["ADMIN","MANAGER"]),
    workflowController
);

router.get(
  "/",
  auth,
  requirerole(["ADMIN", "MANAGER"]),
  getWorkflowsController
);

router.get(
  "/:id",
  auth,
  requirerole(["ADMIN", "MANAGER"]),
  getWorkflowByIdController
);
export default router;

