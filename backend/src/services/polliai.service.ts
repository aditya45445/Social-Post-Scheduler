import { request } from "undici";
import { config } from "../config/config.ts";

const apiKey = config.pollinationApi;

if (!apiKey) {
    throw new Error("Pollinations API key is missing");
}

export async function generatePostImage(
    imagePrompt: string
): Promise<Buffer> {
    try {
        console.log("🖼️ Starting Pollinations image generation...");
        console.log("Prompt:", imagePrompt);

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
                    response_format: "b64_json",
                }),

                // Prevent infinite waiting
                headersTimeout: 30000,
                bodyTimeout: 120000,
            }
        );

        console.log("Pollinations status:", statusCode);

        if (statusCode < 200 || statusCode >= 300) {
            const errorBody = await body.text();

            console.error("❌ Pollinations API error:");
            console.error(errorBody);

            throw new Error(
                `Pollinations image generation failed: ${statusCode} - ${errorBody}`
            );
        }

        const response = (await body.json()) as {
            data?: Array<{
                b64_json?: string;
            }>;
        };

        const imageBase64 = response.data?.[0]?.b64_json;

        if (!imageBase64) {
            console.error("❌ Pollinations response:", response);

            throw new Error("Pollinations returned no image data");
        }

        console.log("✅ Image generated successfully");

        return Buffer.from(imageBase64, "base64");
    } catch (error) {
        console.error("❌ Image generation failed:", error);

        throw error;
    }
}