import { Router } from 'express'
import { generatePost, getGenerations, getPosts, schedulePost } from '../controller/post.controller.ts'
import { protect } from '../middleware/auth.middleware.ts'
import { upload } from '../config/multer.ts'

const postRouter = Router()

postRouter.get('/', protect, getPosts)
postRouter.get('/generations', protect, getGenerations)
postRouter.post('/generate', protect, generatePost)
postRouter.post('/schedule', protect, upload.single('media'), schedulePost)

export default postRouter
