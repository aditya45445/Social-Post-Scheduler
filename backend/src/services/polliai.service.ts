import { request } from "undici";
import { config } from "../config/config.ts";

const apiKey = config.pollinationApi;

if (!apiKey) {
    throw new Error("Pollination API key is missing");
}

export async function generatePostImage(imagePrompt: string): Promise<Buffer> {

    const { statusCode, body } = await request(
        "https://gen.pollinations.ai/v1/images/generations",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },

            body: JSON.stringify({
                prompt: imagePrompt,
                model: "black-forest-labs/flux.1-schnell",
                n: 1,
                size: "1024x1024",
                quality: "high",
                response_format: "b64_json"
            }),
        }
    );

    if (statusCode < 200 || statusCode >= 300) {
        const errorBody = await body.text();
        console.error("Pollinations API error:", errorBody);
        throw new Error(
            `Pollinations image generation failed: ${statusCode}`
        );
    }

    const response = await body.json() as {
        data?: Array<{
            b64_json?: string;
        }>;
    };

    const imageBase64 = response.data?.[0]?.b64_json;

    if (!imageBase64) {
        throw new Error("Pollinations returned no image data");
    }

    const imageBuffer = Buffer.from(imageBase64, "base64")
    return imageBuffer;
}