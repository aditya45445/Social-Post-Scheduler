import { GoogleGenAI } from "@google/genai";
import { config } from "../config/config.ts"

const apiKey = config.geminiApi;

if (!apiKey) {
    throw new Error("Gemini API key is missing");
}

const ai = new GoogleGenAI({
    apiKey,
});


export async function generatePostContent(
    prompt: string,
    tone: string
) {
    const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",

        contents: `
            Generate a social media post based on this prompt:

            "${prompt}"

            Tone: ${tone}

            Return ONLY valid JSON:

            {
                "content": "The social media post",
                "imagePrompt": "A highly descriptive image generation prompt 
                that visually complements the post"
            }
        `,
    });

    const rawText = response.text || "";

    try {
        const cleanedText = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const data = JSON.parse(cleanedText);

        return {
            content: data.content || "",
            imagePrompt: data.imagePrompt || prompt,
        };

    } catch (error) {

        console.error("Gemini JSON parsing error:", error);

        return {
            content: rawText,
            imagePrompt: prompt,
        };
    }
}


