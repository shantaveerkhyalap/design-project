require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("---------------------------------------------------");
    console.log("Testing Gemini API Key...");
    console.log(`Key found in .env: ${apiKey ? apiKey.substring(0, 10) + "..." : "MISSING"}`);

    if (!apiKey) {
        console.error("ERROR: No API Key found in .env file.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-pro-latest", "gemini-2.5-flash-lite", "gemini-3-flash-preview"];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting with model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you working?");
            const response = await result.response;
            const text = response.text();

            console.log(`SUCCESS! API Key is valid and works with ${modelName}.`);
            console.log("Response:", text);
            console.log("---------------------------------------------------");
            return; // Exit on success

        } catch (error) {
            console.warn(`Failed with ${modelName}: ${error.message}`);
            if (error.message.includes("403") || error.message.includes("400")) {
                console.error("Critical Key Error. Stopping.");
                break;
            }
        }
    }
    console.error("FAILED with all tested models. Please check your API usage limits or Key permissions.");
    console.log("---------------------------------------------------");
}

testKey();
