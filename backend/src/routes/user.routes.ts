import { Router } from "express";
import { loginController, registerController } from "../controller/user.controller.ts";

const route = Router()

route.post('/register', registerController)
route.post('/login', loginController)

export default route