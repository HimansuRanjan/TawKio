import app from "./app";
import { createServer } from "http";
import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
import { initSocket } from "./socket";

dotenv.config();
const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

//Create http server form expressApp
const server = createServer(app);

const io = initSocket(server);//add socket to server


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});