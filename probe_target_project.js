const https = require('https');

const projectId = '50000001568003';

function fetchDetail() {
  console.log(`Querying project detail for projectId: ${projectId}...`);
  // Try querying /api/waitingRoom/queryQualified with real projectId
  const wrPath = `/api/waitingRoom/queryQualified?projectId=${projectId}`;
  const options = {
    hostname: 'rest-sig.imaitix.com',
    port: 443,
    path: wrPath,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://hkt.hkticketing.com',
      'Referer': `https://hkt.hkticketing.com/en/#/allEvents/detail?projectId=${projectId}`,
    }
  };

  https.get(options, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log('--- WaitingRoom Check Result ---');
      console.log('Status:', res.statusCode);
      console.log('Body:', d);
    });
  }).on('error', e => console.error(e));
}

fetchDetail();
