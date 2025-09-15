import { user } from "@prisma/client";
import { Request } from "express";
import { FileArray } from "express-fileupload";

export interface AuthenticatedRequest extends Request {
  user?: user;
  files?: FileArray | null | undefined;
}

export interface userType{
  id: string;
  username: string;  
  email: string;
  avatarId:  string | null;   
  avatarUrl: string| null;
  password: string;
}

export interface ResetPasswordParams {
  token?: string;
}