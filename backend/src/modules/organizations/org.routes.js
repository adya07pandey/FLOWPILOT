import express from "express"
import { inviteusercontroller } from "./org.controller.js"
import auth from '../../middlewares/auth.middleware.js'
import requirerole from "../../middlewares/role.middleware.js"

const router = express.Router();

router.post("/invites", 
    auth,
    requirerole(["ADMIN","MANAGER"]),
    inviteusercontroller
);

export default router;

