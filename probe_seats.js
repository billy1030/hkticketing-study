const https = require('https');

// Test other public endpoints like event list, querySalableSeat, queryStandPriceColor, etc.
const projectId = '50000001568003';

function testPaths() {
  const endpoints = [
    `/api/queryStandPriceColor?projectId=${projectId}`,
    `/api/querySalableSeat?projectId=${projectId}`,
    `/api/pms/chooseSeat/queryAreaInfo?projectId=${projectId}`,
    `/api/cms/homepage/siteDetail?projectId=${projectId}`,
  ];

  endpoints.forEach(p => {
    https.get({
      hostname: 'rest-sig.imaitix.com',
      port: 443,
      path: p,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://hkt.hkticketing.com',
        'Referer': `https://hkt.hkticketing.com/en/#/allEvents/detail?projectId=${projectId}`,
        'project-id': projectId,
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        console.log(`\n=== [${res.statusCode}] ${p} ===`);
        console.log(d.substring(0, 400));
      });
    }).on('error', e => console.error(e.message));
  });
}

testPaths();
