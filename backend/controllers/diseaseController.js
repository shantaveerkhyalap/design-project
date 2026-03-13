const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { spawn } = require('child_process');

// Helper function to run Python disease detection model
const runPythonModel = (imagePath) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', 'predict_disease.py');
        
        // Try 'python' first, then 'python3' if it fails
        let pythonCmd = 'python';
        let pythonProcess = spawn(pythonCmd, [scriptPath, imagePath]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.warn(`Python script exited with code ${code}: ${errorString}`);
                resolve(null); // Resolve null on error to allow fallback
                return;
            }
            try {
                // Find potential JSON in the output (in case of logs)
                const jsonMatch = dataString.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : dataString;
                const result = JSON.parse(jsonStr);
                resolve(result);
            } catch (e) {
                console.error("Failed to parse Python output:", dataString);
                resolve(null);
            }
        });

        pythonProcess.on('error', (err) => {
            console.error("Failed to start Python process:", err);
            resolve(null);
        });
    });
};

// @desc    Detect crop disease from image
// @route   POST /api/disease/detect
// @access  Public
const detectDisease = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image file' });
        }

        const imagePath = req.file.path;

        // ─────────────────────────────────────────────────────
        // Step 1: Run local EfficientNetB0 model (PRIMARY)
        // ─────────────────────────────────────────────────────
        console.log("Running local EfficientNetB0 disease detection model...");
        const pythonResult = await runPythonModel(imagePath);
        console.log("Local Model Result:", pythonResult);

        let localModelSucceeded = false;
        let localPrediction = null;

        if (pythonResult && pythonResult.success) {
            localModelSucceeded = true;
            localPrediction = {
                crop: pythonResult.crop,
                status: pythonResult.status,
                diseaseName: pythonResult.diseaseName,
                confidence: pythonResult.confidence,
                model_used: pythonResult.model_used,
                top3: pythonResult.top3_predictions || []
            };
            console.log(`Local model detected: ${localPrediction.crop} - ${localPrediction.status} (${localPrediction.diseaseName}) with ${(localPrediction.confidence * 100).toFixed(1)}% confidence`);
        } else if (pythonResult && pythonResult.error) {
            console.log("Local model error:", pythonResult.error);
        }

        // ─────────────────────────────────────────────────────
        // Step 2: Use Gemini for remedies & enhanced analysis
        // ─────────────────────────────────────────────────────
        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

                const imageData = fs.readFileSync(imagePath);
                const imageBase64 = imageData.toString('base64');

                // Build a smarter prompt using local model results
                let contextInfo = "";
                if (localModelSucceeded) {
                    contextInfo = `
                    IMPORTANT CONTEXT: Our local ML model (EfficientNetB0 trained on PlantVillage) has already analyzed this image with the following results:
                    - Identified Crop: ${localPrediction.crop}
                    - Status: ${localPrediction.status}
                    - Disease Detected: ${localPrediction.diseaseName}
                    - Confidence: ${(localPrediction.confidence * 100).toFixed(1)}%
                    
                    Use this as a strong reference. If you agree with the model's diagnosis, provide detailed remedies.
                    If you disagree, explain why and provide your own assessment.
                    `;
                }

                const prompt = `
                Analyze this crop/plant leaf image for disease detection.
                ${contextInfo}
                
                1. Identify/confirm the crop name.
                2. Detect if there is any disease. If healthy, say "Healthy".
                3. If diseased, provide the correct disease name.
                4. Provide a clear description of the condition.
                5. Provide 3-4 practical remedies or preventive measures.
                
                Respond in STRICT JSON format (no markdown, no code fences):
                {
                    "crop": "Crop Name",
                    "status": "Healthy or Diseased",
                    "diseaseName": "Name of disease or None",
                    "confidence": 0.95,
                    "description": "Brief description of the condition and its impact",
                    "remedies": ["Remedy 1", "Remedy 2", "Remedy 3"]
                }
                `;

                const result = await model.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: req.file.mimetype
                        }
                    }
                ]);

                const response = await result.response;
                const text = response.text();
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const geminiResponse = JSON.parse(cleanText);

                // Cleanup uploaded file
                cleanupFile(imagePath);

                // Build final response: prioritize local model for classification,
                // use Gemini for description and remedies
                const finalResponse = {
                    crop: localModelSucceeded ? localPrediction.crop : geminiResponse.crop,
                    status: localModelSucceeded ? localPrediction.status : geminiResponse.status,
                    diseaseName: localModelSucceeded ? localPrediction.diseaseName : geminiResponse.diseaseName,
                    confidence: localModelSucceeded ? localPrediction.confidence : geminiResponse.confidence,
                    description: geminiResponse.description || "Disease analysis complete.",
                    remedies: geminiResponse.remedies || [],
                    analysisSource: localModelSucceeded ? "Local EfficientNetB0 Model + Gemini AI" : "Gemini AI Vision"
                };

                // Include local model details if available
                if (localModelSucceeded) {
                    finalResponse.localModelPrediction = localPrediction;
                }

                return res.json(finalResponse);

            } catch (aiError) {
                console.error("Gemini API Error:", aiError.message);
                // If Gemini fails but local model succeeded, still return results
                if (localModelSucceeded) {
                    cleanupFile(imagePath);
                    return res.json({
                        crop: localPrediction.crop,
                        status: localPrediction.status,
                        diseaseName: localPrediction.diseaseName,
                        confidence: localPrediction.confidence,
                        description: `${localPrediction.crop} detected with ${localPrediction.status === 'Diseased' ? localPrediction.diseaseName : 'no disease'}. Confidence: ${(localPrediction.confidence * 100).toFixed(1)}%.`,
                        remedies: getDefaultRemedies(localPrediction.diseaseName),
                        analysisSource: "Local EfficientNetB0 Model (Gemini unavailable)"
                    });
                }
                // Fall through to mock response
            }
        } else if (localModelSucceeded) {
            // No API key but local model works — return local model result
            cleanupFile(imagePath);
            return res.json({
                crop: localPrediction.crop,
                status: localPrediction.status,
                diseaseName: localPrediction.diseaseName,
                confidence: localPrediction.confidence,
                description: `${localPrediction.crop} analyzed by local disease detection model. ${localPrediction.status === 'Diseased' ? `Disease identified: ${localPrediction.diseaseName}.` : 'The plant appears healthy.'}`,
                remedies: getDefaultRemedies(localPrediction.diseaseName),
                analysisSource: "Local EfficientNetB0 Model"
            });
        }

        // ─────────────────────────────────────────────────────
        // Step 3: Fallback mock response (no model, no API key)
        // ─────────────────────────────────────────────────────
        cleanupFile(imagePath);

        res.json({
            crop: "Unknown",
            status: "Unknown",
            diseaseName: "Analysis Unavailable",
            confidence: 0,
            description: "Neither the local disease detection model nor the Gemini API could process this image. Please ensure the model file exists in backend/models/ and/or a valid GEMINI_API_KEY is set in .env.",
            remedies: [
                "Place crop_disease_final_model.keras in backend/models/",
                "Or add GEMINI_API_KEY to your .env file",
                "Ensure Python and TensorFlow are installed"
            ],
            analysisSource: "None - Setup Required"
        });

    } catch (error) {
        console.error("Critical Disease Detection Error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                message: 'Server Error during analysis',
                error: error.message
            });
        }
    }
};

// Helper: Clean up uploaded file safely
function cleanupFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.warn("Warning: Failed to delete temp file:", err.message);
    }
}

// Helper: Provide basic remedies when Gemini is unavailable
function getDefaultRemedies(diseaseName) {
    if (!diseaseName || diseaseName === 'None' || diseaseName === 'Healthy') {
        return [
            "Continue regular watering and fertilization",
            "Monitor for any signs of pest or disease",
            "Ensure adequate sunlight and ventilation"
        ];
    }

    // Generic disease remedies
    return [
        `Consult a local agricultural expert about ${diseaseName}`,
        "Remove and destroy infected leaves to prevent spread",
        "Apply appropriate fungicide or pesticide as recommended",
        "Improve air circulation around the plant"
    ];
}

module.exports = {
    detectDisease
};
