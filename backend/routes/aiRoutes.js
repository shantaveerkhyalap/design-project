const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");



// @desc    Calculate yield potential using AI
// @route   POST /api/ai/yield
// @access  Public (should be protected in prod)
router.post('/yield', async (req, res) => {
    try {
        const { area, unit, location } = req.body;
        console.log("AI Yield Request:", { area, unit, location });

        if (!area || !unit) {
            console.log("Missing area or unit");
            return res.status(400).json({ message: 'Area and unit are required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        console.log("Gemini API Key Status:", apiKey ? "Present" : "Missing");
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");
            // Return mock data for testing if key is missing (optional fallback)
            // But better to error so user knows to add key
            return res.status(500).json({
                message: 'AI Service Unavailable: Missing API Key. Please add GEMINI_API_KEY to backend .env'
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
        Act as an expert agricultural consultant.
        A user has ${area} ${unit} of available space for farming in or near ${location}.
        
        Analyze the potential for this specific area and location (consider climate of ${location} if known).
        Suggest the best crops to grow in this specific space size (e.g. if small, suggest herbs/microgreens; if large, suggest staples).
        
        Provide the response in STRICT JSON format with the following structure:
        {
            "crops": ["Crop 1", "Crop 2", "Crop 3"],
            "estimatedIncome": "Range of income (e.g. ₹15,000 - ₹25,000 / month)",
            "bestMethod": "Recommended farming method (e.g. Hydroponics, Vertical Farming, Open Field)"
        }
        Do not include any markdown formatting like \`\`\`json. Just return the raw JSON string.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown if model adds it despite instructions
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonResponse = JSON.parse(cleanText);
            return res.json(jsonResponse);

        } catch (aiError) {
            console.error("Gemini Yield API Error:", aiError.message);
            // Fallback to mock data if API fails
            return res.json({
                crops: ["Tomato (Simulated)", "Spinach", "Chili"],
                estimatedIncome: "₹10,000 - ₹20,000 / month (Mock Estimate)",
                bestMethod: "Organic Farming (Fallback Recommendation due to API Error)"
            });
        }
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: 'Failed to generate recommendations' });
    }
});

// @desc    Generate multi-cropping plan using AI
// @route   POST /api/ai/multi-crop
// @access  Public
router.post('/multi-crop', async (req, res) => {
    try {
        const { acres, location, soilType } = req.body;
        console.log("Multi-Crop Request (Gemini):", { acres, location, soilType });

        // Validate acres
        if (!acres || isNaN(acres) || Number(acres) <= 0) {
            return res.status(400).json({
                message: 'Invalid land size. Acres must be a positive number greater than 0. Cropping is not possible with 0 or negative land area.'
            });
        }

        if (!location) {
            return res.status(400).json({ message: 'Location is required for accurate recommendations.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                message: 'AI Service Unavailable: Missing Gemini API Key.'
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
You are an expert agricultural consultant and multi-cropping specialist. A farmer has:
- Total Land: ${acres} acres
- Location: ${location}
- Soil Type: ${soilType || 'Not specified'}

Your task:
1. RESEARCH the climate, rainfall, and agricultural conditions of "${location}".
2. Based on REAL agricultural science, suggest a practical multi-layer cropping plan.
3. Think about companion planting — crops that BENEFIT each other (nitrogen fixers near heavy feeders, shade-tolerant under canopy, etc.).
4. Distribute the ${acres} acres LOGICALLY across layers. Not every layer needs equal space. Trees need more room; ground cover can be intercropped.
5. For each crop, provide REALISTIC durations, water needs, and income estimates for the specified region.

DO NOT just list generic crops. Tailor your recommendation to the specific location's climate and the soil type.

Provide the response in STRICT JSON format (no markdown, no code fences):
{
    "planTitle": "A short descriptive title for this plan",
    "summary": "2-3 sentence overview of the strategy",
    "totalAcres": ${acres},
    "location": "${location}",
    "soilType": "${soilType || 'General'}",
    "layers": [
        {
            "layer": "Canopy Layer",
            "crops": "Specific tree names suited for this region",
            "acresAllocated": <number>,
            "reason": "Why these trees work here"
        },
        {
            "layer": "Mid Layer",
            "crops": "Medium height plants suited for this region",
            "acresAllocated": <number>,
            "reason": "Why these work as mid-layer"
        },
        {
            "layer": "Ground Layer",
            "crops": "Ground-level crops suited for this region",
            "acresAllocated": <number>,
            "reason": "Why these are ideal ground cover"
        },
        {
            "layer": "Root Layer",
            "crops": "Root/tuber crops suited for this region",
            "acresAllocated": <number>,
            "reason": "Why these complement the system"
        }
    ],
    "cropDetails": [
        {
            "name": "Crop Name",
            "layer": "Which layer",
            "acres": <number>,
            "duration": "Growth to harvest time",
            "waterNeeds": "Low/Medium/High + specifics",
            "expectedIncome": "Estimated income per acre per season in INR",
            "season": "Best planting season"
        }
    ],
    "tips": [
        "Practical tip 1 specific to this plan",
        "Practical tip 2",
        "Practical tip 3"
    ],
    "estimatedTotalIncome": "Total estimated annual income range in INR"
}
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonResponse = JSON.parse(cleanText);
            return res.json(jsonResponse);

        } catch (aiError) {
            console.error("Gemini Multi-Crop API Error:", aiError.message);

            // Fallback Mock Data
            return res.json({
                planTitle: "Integrated Multi-Layer Cropping (Simulated)",
                summary: "This is a fallback plan because the AI service is currently unavailable. It suggests a standard model.",
                totalAcres: acres,
                location: location,
                soilType: soilType || 'General',
                layers: [
                    {
                        layer: "Canopy Layer (Mock)",
                        crops: "Mango / Coconut",
                        acresAllocated: acres * 0.4,
                        reason: "Standard high-value canopy crops."
                    },
                    {
                        layer: "Mid Layer (Mock)",
                        crops: "Banana / Papaya",
                        acresAllocated: acres * 0.3,
                        reason: "Fast growing fruit fillers."
                    },
                    {
                        layer: "Ground Layer (Mock)",
                        crops: "Turmeric / Ginger",
                        acresAllocated: acres * 0.3,
                        reason: "Shade loving cash crops."
                    }
                ],
                cropDetails: [
                    {
                        name: "Mango",
                        layer: "Canopy",
                        acres: acres * 0.4,
                        duration: "5-6 Years",
                        waterNeeds: "Medium",
                        expectedIncome: "₹1,00,000/acre",
                        season: "June-July"
                    }
                ],
                tips: ["Ensure proper drainage", "Use organic mulch", "Check soil pH"],
                estimatedTotalIncome: "₹3,50,000 - ₹5,00,000 / year (Estimated)"
            });
        }

    } catch (error) {
        console.error("Multi-Crop AI Error:", error);
        res.status(500).json({ message: 'Failed to generate multi-cropping plan. Please try again.' });
    }
});

module.exports = router;
