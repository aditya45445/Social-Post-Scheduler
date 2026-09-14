import type { Request, Response } from "express";
import userModel from "../model/user.model.ts";
import { config } from "../config/config.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function registerController(req: Request, res: Response) {
    try {
        const { username, email, password } = req.body;


        const isUserAlreadyRegistered = await userModel.findOne({
            $or: [{ email }, { username }],
        });

        if (isUserAlreadyRegistered) {
            return res.status(422).json({
                message: "this user is already registered",
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashPassword,
        });

        const token = jwt.sign(
            { id: user._id },
            config.jwtSecret as string,
            { expiresIn: "3d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: "user is successfully registered",
            user: {
                userid: user._id,
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function loginController(req: Request, res: Response) {
    try {

        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: "user not registered" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ message: "invalid password" })
        }

        const token = jwt.sign(
            { id: user._id },
            config.jwtSecret as string,
            { expiresIn: "3d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "user is successfully logged in",
            user: {
                userid: user._id,
                username: user.username,
                email: user.email,
            },
            token,
        });


    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
