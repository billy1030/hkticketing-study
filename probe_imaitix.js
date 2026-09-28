const https = require('https');

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'rest-sig.imaitix.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://hkt.hkticketing.com',
        'Referer': 'https://hkt.hkticketing.com/',
        'Accept-Language': 'zh-HK,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          headers: res.headers,
          body: data.substring(0, 500)
        });
      });
    });

    req.on('error', (err) => resolve({ path, error: err.message }));
    req.end();
  });
}

async function run() {
  console.log('Testing true Backend Gateway (https://rest-sig.imaitix.com):');
  const apis = [
    '/api/cms/homepage/siteDetail',
    '/api/cms/queryIntegrationConfig',
    '/api/pro/events?page=1&pageSize=10',
    '/api/waitingRoom/queryQualified?projectId=1001',
  ];

  for (const api of apis) {
    const res = await testEndpoint(api);
    console.log(`\n=== [${res.status}] ${res.path} ===`);
    console.log('Content-Type:', res.contentType);
    console.log('Body:', res.body);
  }
}

run();
