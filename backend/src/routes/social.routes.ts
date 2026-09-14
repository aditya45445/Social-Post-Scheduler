import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.ts'
import { generateAuthUrl, syncAccounts } from '../controller/socialAcc.controller.ts'

const socialRouter = Router()

socialRouter.get('/:platform/url', protect, generateAuthUrl)

socialRouter.get('/sync', protect, syncAccounts)

export default socialRouter