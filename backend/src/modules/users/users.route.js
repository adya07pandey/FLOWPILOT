import express from "express"
import auth from '../../middlewares/auth.middleware.js'
import { getOrgNameController, getOrgUsersController } from "./users.controller.js";

const router = express.Router();



router.get("/users/org", 
    auth,
    getOrgUsersController,
);
router.get("/orgname",
    auth,
    getOrgNameController,
);

export default router;

