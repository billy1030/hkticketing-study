const https = require('https');

const projectId = '50000001568003';

const options = {
  hostname: 'rest-sig.imaitix.com',
  port: 443,
  path: `/api/pro/project?projectId=${projectId}`,
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://hkt.hkticketing.com',
    'Referer': `https://hkt.hkticketing.com/en/#/allEvents/detail?projectId=${projectId}`,
    'project-id': projectId,
    'Site': 'm',
  }
};

https.get(options, (res) => {
  console.log('Status with project-id header:', res.statusCode);
  console.log('Headers:', res.headers);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Body:', d.substring(0, 1000)));
}).on('error', e => console.error(e));
