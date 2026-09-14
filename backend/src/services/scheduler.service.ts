import cron from 'node-cron'
import postModel from '../model/post.model.ts'
import accountModel from '../model/account.model.ts'
import activityLogModal from '../model/activityLog.model.ts'
import zernio from '../services/zernio.service.ts'

export const intiScheduler = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date()
            const postsToPublish = await postModel.find({
                status: "scheduled",
                scheduledFor: { $lte: now }
            });

            for (const post of postsToPublish) {
                try {

                    const accounts = await accountModel.find({
                        user: post.user,
                        platform: { $in: post.platforms },
                        status: "connected",
                        zernioAccountId: { $exists: true, $ne: null }
                    })


                    if (accounts.length === 0) {
                        console.log(`no connected zernio accounts found for post ${post._id}`);
                        continue
                    }

                    const zernioPlatforms = accounts.map((acc) => ({
                        platform: acc.platform as any,
                        accountId: acc.zernioAccountId!
                    }))

                    const payload = {
                        content: post.content,
                        publishNow: true,
                        ...(post.mediaUrl ? { mediaItems: [{ type: post.mediaType || "image", url: post.mediaUrl }] } : {}),
                        platforms: zernioPlatforms,
                    }

                    console.log(`Publishing post ${post._id} to zernio with media: ${post.mediaUrl || "none"} `);

                    const response = await zernio.posts.createPost({
                        body: payload
                    })

                    const publishedPost = (response.data as any)?.post || response.data

                    if (!publishedPost) {
                        throw new Error("failed to get post object from zernio response")
                    }

                    console.log(`zernio post created: ${publishedPost._id || publishedPost.id}`);

                    post.status = "published"
                    await post.save()

                    await activityLogModal.create({
                        user: post.user,
                        actionType: "POST_PUBLISHED",
                        description: `Post published successfully to ${accounts.map((a) => a.platform).join(", ")}`,
                        relatedPost: post._id,
                    })

                } catch (err: any) {
                    console.error(`failed to publish post ${post._id} :`, err?.response?.data || err?.message);
                    post.status = "failed"
                    await post.save()
                }
            }
            if (postsToPublish.length > 0) {
                console.log(`evauluated ${postsToPublish.length} post at ${now.toISOString()}`);
            }
        } catch (error) {
            console.error(`scheduler error`, error);
        }
    })
    console.log("scheduler service initialized");
}