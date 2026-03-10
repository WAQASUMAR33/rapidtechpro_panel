const fetch = require('node-fetch');

async function testProxy() {
    const baseUrl = 'http://localhost:3000';
    const apiKey = 'rapidtech_secret_key_2026';

    const testPaths = [
        '/api/proxy/api/projects',
        '/api/proxy/api/categories',
        '/api/proxy/api/services',
        '/api/proxy/api/technologies'
    ];

    for (const path of testPaths) {
        console.log(`\nTesting: ${path}`);
        try {
            const res = await fetch(`${baseUrl}${path}`, {
                headers: { 'x-api-key': apiKey }
            });
            console.log(`Status: ${res.status}`);
            const data = await res.json();

            if (res.ok) {
                console.log('Success: Received data');
                // Since DB is unreachable, we expect 503 from the resilience logic
            } else {
                console.log('Error Response:', data.message || data.error);
            }
        } catch (err) {
            console.error('Fetch failed:', err.message);
        }
    }
}

testProxy();
