import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error";
import fileUpload from "express-fileupload";

import userRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import likeRoutes from "./routes/likeRoutes";

dotenv.config();

const app_url = process.env.APP_URL;

const app = express();
app.use(cors({ origin: [`${app_url}`], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
})
);

app.use("/v.1/api/user", userRoutes);
app.use("/v.1/api/post", postRoutes);
app.use("/v.1/api/comment", commentRoutes);
app.use("/v.1/api/like", likeRoutes);

app.use(errorMiddleware);

export default app;