const http = require('http');

const data = JSON.stringify({
    area: 100,
    unit: 'sq. meters',
    location: 'Bangalore'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/yield',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    let body = '';

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

req.write(data);
req.end();
