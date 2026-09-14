import type { AuthRequest } from "../middleware/auth.middleware.ts"
import accountModel from "../model/account.model.ts"
import type { Response } from "express"
import zernio from "../services/zernio.service.ts";


// get all accounts
export async function getAccounts(req: AuthRequest, res: Response): Promise<void> {
    try {
        const accounts = await accountModel.find({
            user: req.user._id
        })
        res.json({
            accounts
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message || "server error"
        })
    }
}

// add accounts
export async function addAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { platform, handle, avatarUrl } = req.body
        const account = await accountModel.create({
            user: req.user._id,
            platform,
            handle,
            avatarUrl
        })
        res.status(201).json({
            account
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message || "server error"
        })
    }
}

//disconnect Accounts
export async function disconnectAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
        const account = await accountModel.findOne({
            _id: req.params._id,
            user: req.user._id
        })

        if (!account) {
            res.status(404).json({
                message: "Account not found"
            })
            return
        }

        if (account.zernioAccountId) {
            await zernio.accounts.deleteAccount({
                path: {
                    accountId: account.zernioAccountId
                }
            })
        }

        await accountModel.deleteOne()
        res.json({
            message: "Account disconnected successfully"
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message || "server error"
        })
    }
}