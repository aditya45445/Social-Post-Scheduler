import activityLogModel from "../model/activityLog.model.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";
import type { Response } from "express";

export async function getActivity(req: AuthRequest, res: Response): Promise<void> {

    try {
        const log = await activityLogModel.find({
            user: req.user?._id
        }).sort({ createdAt: -1 }).limit(10).populate('relatedPost', 'content')

        res.status(200).json({
            success: true,
            log
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error while fetching activity",
            error: error
        })
    }

}