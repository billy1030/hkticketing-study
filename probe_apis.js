const https = require('https');

function testEndpoint(path, headers = {}) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'hkt.hkticketing.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://hkt.hkticketing.com/',
        'Accept-Language': 'zh-HK,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 500)
        });
      });
    });

    req.on('error', (err) => {
      resolve({ path, error: err.message });
    });

    req.end();
  });
}

async function run() {
  console.log('Testing Live Endpoints:');
  const results = await Promise.all([
    testEndpoint('/api/ticketSale/allEvents'),
    testEndpoint('/api/ticketSale/search?page=1&pageSize=10'),
    testEndpoint('/api/ticketSale/detail?projectId=1001'),
    testEndpoint('/api/waitingRoom/queryQualified?projectId=1001'),
  ]);

  results.forEach(r => {
    console.log(`\n=== [${r.status}] ${r.path} ===`);
    console.log('Response Snippet:', r.body);
  });
}

run();
