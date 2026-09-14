import { Router } from "express";
import { protect } from "../middleware/auth.middleware.ts";
import { getAccounts, addAccount, disconnectAccount } from "../controller/account.controller.ts";

const accountRouter = Router()

accountRouter.get('/get', protect, getAccounts)
accountRouter.post('/add', protect, addAccount)
accountRouter.delete('/disconnect/:id', protect, disconnectAccount)


export default accountRouter