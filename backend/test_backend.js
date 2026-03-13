const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/weather?lat=12.9716&lon=77.5946', // Bangalore
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    let body = ''; // Buffer to store response body

    res.on('data', (d) => {
        body += d;
    });

    res.on('end', () => {
        console.log("Response Body:", body);
    });
});

req.on('error', (error) => {
    console.error(error);
});

// req.write(data);
req.end();
