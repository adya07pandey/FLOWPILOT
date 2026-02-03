import express from 'express'
import {config} from "dotenv";
import {connectDB,disconnectDB } from './config/db.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import orgroutes from "./modules/organizations/org.routes.js";
import workflowroutes from "./modules/workflows/workflow.routes.js";
import taskroutes from "./modules/tasks/task.routes.js"
import approvalroutes from "./modules/approval/approval.routes.js"
import userorgroutes from "./modules/users/users.route.js"
import dashboardroutes from "./modules/dashboard/dashboard.routes.js"








config();
connectDB();

const app = express()

app.use(cors({
  origin: "https://flowpilot-smoky.vercel.app",
  credentials: true,
}));

app.use(express.json());
//body passing middlewares
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("FlowPilot backend is running 🚀");
});


app.use("/auth", authRoutes);
app.use("/organizations",orgroutes);
app.use("/workflow", workflowroutes);
app.use("/",taskroutes);
app.use("/approvals",approvalroutes);
app.use("/",userorgroutes);
app.use("/", dashboardroutes);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(async () => {
    await disconnectDB();
    process.exit(1);
    });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    
    server.close(async () => {
    await disconnectDB();
    process.exit(0);
    });
});
