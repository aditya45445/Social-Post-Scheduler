import { Router } from "express";
import { protect } from "../middleware/auth.middleware.ts";
import { getActivity } from "../controller/activity.controller.ts";

const activityRouter = Router()

activityRouter.get('/', protect, getActivity);

export default activityRouter;