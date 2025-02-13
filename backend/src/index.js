import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app, server} from "./lib/socket.js";
// const app = express();


dotenv.config();


const PORT = process.env.PORT;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173", // Allow requests from this origin
        credentials: true, // Allow cookies and credentials
    })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
    console.log("server is running on PORT:" + PORT);
    connectDB();
});