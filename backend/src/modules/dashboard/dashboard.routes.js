import express from "express"
import auth from '../../middlewares/auth.middleware.js'
import {  dashboardController } from "./dashboard.controller.js";


const router = express.Router();


router.get(
  "/dashboard",
  auth,
  dashboardController
);

export default router;

