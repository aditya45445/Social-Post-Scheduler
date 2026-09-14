import express from "express";
import cors from "cors";
import route from "./routes/user.routes.ts";
import socialRouter from "./routes/social.routes.ts";
import accountRouter from "./routes/account.routes.ts";
import postRouter from "./routes/post.routes.ts";
import activityRouter from "./routes/activity.routes.ts";
import { intiScheduler } from "./services/scheduler.service.ts";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://your-frontend.onrender.com",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("CORS Not Allowed"));
            }
        },
        credentials: true,
    })
);

app.use(express.json())

app.use('/api/auth', route)
app.use('/api/social', socialRouter)
app.use('/api/account', accountRouter)
app.use('/api/post', postRouter)
app.use('/api/activity', activityRouter)

intiScheduler()

export default app