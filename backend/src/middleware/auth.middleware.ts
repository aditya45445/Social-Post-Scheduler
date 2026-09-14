import type { NextFunction, Request, Response } from "express"
import { config } from "../config/config.ts"
import jwt from "jsonwebtoken"
import userModel from "../model/user.model.ts"
import multer from "multer"

export interface AuthRequest extends Request {
    user?: any
}

export async function protect(req: AuthRequest, res: Response, next: NextFunction) {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded: any = jwt.verify(token, config.jwtSecret as string)
            req.user = await userModel.findById(decoded.id).select('-password')
            next()
        }
        catch (error: any) {
            res.status(401).json({
                message: "Not authorized"
            })
        }
    } else {
        res.status(401).json({
            message: "No token provided"
        })
    }
}

