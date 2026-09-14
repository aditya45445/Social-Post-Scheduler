import ImageKit from '@imagekit/nodejs';
import { config } from "../config/config.ts"

const client = new ImageKit({
    privateKey: config.imageKitApi, // This is the default and can be omitted
});

export async function uploadImage(imageBuffer: Buffer, fileName: string) {

    const response = await client.files.upload({
        file: imageBuffer.toString('base64'),
        fileName,
        folder: '/social-media-posts'
    });

    return {
        url: response.url,
        filed: response.fileId,
        mediaType: "image" as const
    }
}