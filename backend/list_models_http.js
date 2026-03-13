const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API KEY found.");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Querying available models...");

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error.message);
            } else {
                console.log("Available Models:");
                if (json.models) {
                    json.models.forEach(m => {
                        console.log(`- ${m.name} (${m.displayName})`);
                        console.log(`  Supported: ${m.supportedGenerationMethods.join(', ')}`);
                    });
                } else {
                    console.log("No models returned (Key might have no permissions?)");
                    console.log(JSON.stringify(json, null, 2));
                }
            }
        } catch (e) {
            console.error("Failed to parse response:", e.message);
            console.log("Raw:", data);
        }
    });

}).on('error', (err) => {
    console.error("Request Error:", err.message);
});
