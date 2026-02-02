import express from "express"
import { signup,login,logout } from "./auth.controller.js";
import auth from "../../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout",logout);

router.get("/me", auth, (req, res) => {
  
  res.status(200).json({
    user: req.user,
  });
});

export default router;

