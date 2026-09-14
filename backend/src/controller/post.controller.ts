import type { AuthRequest } from "../middleware/auth.middleware.ts"
import type { Response } from "express"
import { generatePostContent } from "../services/gemini.service.ts"
import { generatePostImage } from "../services/polliai.service.ts"
import { uploadImage } from "../services/imageKit.service.ts"
import generationModel from "../model/generation.model.ts"
import postModel from "../model/post.model.ts"

//generate post 
export async function generatePost(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { prompt, tone, generateImage } = req.body

        const { content, imagePrompt } = await generatePostContent(prompt, tone)

        let mediaUrl: string | undefined;
        let mediaType = "image" as "image" | "video";

        if (generateImage && imagePrompt) {
            const imageBuffer = await generatePostImage(imagePrompt)

            const uploadResult = await uploadImage(imageBuffer, `post-${Date.now()}.png`)

            mediaUrl = uploadResult.url
            mediaType = "image"
        } else {
            console.log("image not generated")
        }

        const generation = await generationModel.create({
            user: req.user?.id,
            prompt,
            tone,
            content,
            mediaUrl,
            mediaType
        })

        res.status(201).json({
            message: "Post generated successfully",
            generation
        })

    } catch (error: any) {
        res.status(500).json({
            message: error.message || "server error"
        })
    }
}


//get generations
export async function getGenerations(req: AuthRequest, res: Response): Promise<void> {
    try {
        const generations = await generationModel.find({ user: req.user?._id }).sort({ createdAt: -1 })

        res.status(200).json(generations)
    } catch (error: any) {
        res.status(500).json({
            message: error.message || "server error"
        })
    }
}

//get posts
export async function getPosts(req: AuthRequest, res: Response): Promise<void> {
    try {
        const post = await postModel.find({ user: req.user?._id })

        res.status(200).json(post)
    } catch (error: any) {
        res.status(500).json({
            message: error.message || "server error"
        })
    }
}

// Schedule Post
export async function schedulePost(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { content, platforms, scheduledFor, status } = req.body

        // parse platoforms if it comes as a stringified array from FormData

        let parsedPlatforms = platforms;
        if (typeof platforms === 'string') {
            try {
                parsedPlatforms = JSON.parse(platforms)
            } catch (error) {
                parsedPlatforms = platforms.split(",")
            }
        }

        let mediaUrl: string | undefined = req.body.mediaUrl
        let mediaType: 'image' | 'video' | undefined = req.body.mediaType


        if (req.file) {
            const uploadResult = await uploadImage(req.file.buffer, `scheduled-${Date.now()}.png`)

            mediaUrl = uploadResult.url
            mediaType = uploadResult.mediaType
        }

        const post = await postModel.create({
            user: req.user?._id,
            content,
            mediaUrl,
            mediaType,
            platforms: parsedPlatforms,
            scheduledFor: new Date(scheduledFor),
            status: status || "scheduled"
        })

        res.status(201).json({
            message: "Post scheduled successfully",
            post
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message || "server error"
        })
    }
}

