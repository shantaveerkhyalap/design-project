const http = require('http');

// Helper wrapper for requests
function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : {} });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function test() {
    try {
        console.log("1. Login to get token...");
        // Use a known user or create one. Assuming 'testuser@example.com' exists from previous tests or I'll register one.
        // Let's try to register a new random user to be safe.
        const rand = Math.floor(Math.random() * 10000);
        const email = `progress_test_${rand}@example.com`;
        const password = 'password123';

        const registerData = JSON.stringify({
            name: 'Progress Tester',
            email: email,
            password: password
        });

        const registerRes = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/users',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(registerData)
            }
        }, registerData);

        let token;
        if (registerRes.statusCode === 201) {
            token = registerRes.body.token;
            console.log("   Registered new user. Token received.");
        } else {
            console.log("   Registration failed, trying login...");
            // logic to login if needed, but random email should work
            throw new Error("Registration failed: " + JSON.stringify(registerRes.body));
        }

        console.log("\n2. Update Progress (Rice, Stage 1)...");
        const progressData = JSON.stringify({
            moduleId: 'rice',
            stage: 1
        });

        const updateRes = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/users/progress',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(progressData),
                'Authorization': `Bearer ${token}`
            }
        }, progressData);

        console.log(`   Status: ${updateRes.statusCode}`);
        console.log(`   Body: ${JSON.stringify(updateRes.body)}`);

        console.log("\n3. Update Progress (Rice, Stage 2)...");
        const progressData2 = JSON.stringify({
            moduleId: 'rice',
            stage: 2
        });

        const updateRes2 = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/users/progress',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(progressData2),
                'Authorization': `Bearer ${token}`
            }
        }, progressData2);

        console.log(`   Status: ${updateRes2.statusCode}`);

        console.log("\n4. Get Progress...");
        const getRes = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/users/progress',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`   Status: ${getRes.statusCode}`);
        console.log(`   Body: ${JSON.stringify(getRes.body)}`);

        const progress = getRes.body;
        const riceModule = progress.find(p => p.moduleId === 'rice');
        if (riceModule && riceModule.completedStages.includes(1) && riceModule.completedStages.includes(2)) {
            console.log("\nSUCCESS: Progress saved and retrieved correctly!");
        } else {
            console.log("\nFAILURE: Progress data mismatch.");
        }

    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
