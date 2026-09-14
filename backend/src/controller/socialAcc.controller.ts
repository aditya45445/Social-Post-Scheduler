import type { Response } from "express";
import accountModel from "../model/account.model.ts";
import zernio from "../services/zernio.service.ts";
import userModel from "../model/user.model.ts";
import type { AuthRequest } from "../middleware/auth.middleware.ts";

const getOrCreateZernioProfile = async (user: any): Promise<string> => {
    try {
        const result = await zernio.profiles.listProfiles()
        const data = result.data as any;
        const profiles: any[] = Array.isArray(data) ? data : data?.profiles || data?.data || [];

        if (profiles.length > 0) {
            const pid = profiles[0]._id || profiles[0].id
            await userModel.findByIdAndUpdate(
                user._id,
                { zernioProfileId: pid }
            )
            return pid
        }

        const createResult = await zernio.profiles.createProfile({
            body: { name: `${user.username || user.email}'s workspace` } as any,
        })

        const created = (createResult.data as any)?.profile || createResult.data

        const pid = created?._id || created?.id

        if (!pid) {
            throw new Error('Failed to get profile ID')
        }

        await userModel.findByIdAndUpdate(
            user._id,
            { zernioProfileId: pid }
        )
        return pid
    } catch (error: any) {
        console.error("getOrCrearteZernioProfile Error:", error?.message || error)
        throw error
    }
}


export async function generateAuthUrl(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { platform } = req.params
        const profileId = await getOrCreateZernioProfile(req.user);

        const origin = req.headers.origin
        const redirectUrl = `${origin}/accounts`

        const result = await zernio.connect.getConnectUrl({
            path: {
                platform: platform as any
            },
            query: {
                profileId,
                redirect_url: redirectUrl
            }
        })

        const data = result.data as any
        console.log("getconnectUrl response:", JSON.stringify(data, null, 2))

        const authUrl = data?.authUrl;

        if (!authUrl) {
            throw new Error("Failed to get auth url")
        }

        res.json({ url: authUrl });

    } catch (error: any) {
        res.status(500).json({
            message: error.message || "server error"
        })
    }

}

export async function syncAccounts(req: AuthRequest, res: Response): Promise<void> {
    try {
        const profileId = await getOrCreateZernioProfile(req.user);
        const result = await zernio.accounts.listAccounts({
            query: { profileId } as any
        })

        const data = result.data as any
        console.log("listAccounts response", JSON.stringify(data, null, 2))

        const zernioAccounts: any[] = data?.accounts || (Array.isArray(data) ? data : [])

        if (zernioAccounts.length === 0) {
            res.status(200).json({
                message: "No accounts found"
            })
            return
        }

        const supportedPlatforms = ["twitter", "instagram", "facebook", "linkedin"]
        const syncedAccounts = []

        for (const zAccounts of zernioAccounts) {
            const zid = zAccounts._id || zAccounts.id
            if (!zid) {
                console.warn("skipping account with no ID:", zAccounts);
                continue
            }

            const rawPlatform = (zAccounts.platform || zAccounts.type || "").toLowerCase()
            const normalizedPlatform = supportedPlatforms.find((p) => rawPlatform.includes(p))

            if (!normalizedPlatform) {
                console.log(`skipping unsuported platform :"${rawPlatform}"`)
                continue
            }

            const account = await accountModel.findOneAndUpdate({
                zernioAccountId: zid
            },
                {
                    user: req.user._id,
                    platform: normalizedPlatform,
                    handle: zAccounts.username || zAccounts.name || zAccounts.handle || "unknown",
                    zernioAccountId: zid,
                    status: 'connected',
                    avatarUrl: zAccounts.avatarUrl || zAccounts.picture || zAccounts.profile_image_url,

                }, {
                upsert: true,
                returnDocument: 'after'
            })

            syncedAccounts.push(account)
        }

        res.json({
            syncedAccounts
        })
    } catch (error: any) {
        res.status(500).json({
            message: error.message || "server error"
        })
    }
}