const https = require('https');

const projectId = '50000001568003';
const path = `/api/pro/project?projectId=${projectId}`;
console.log('Querying real project endpoint:', path);

const options = {
  hostname: 'rest-sig.imaitix.com',
  port: 443,
  path: path,
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://hkt.hkticketing.com',
    'Referer': `https://hkt.hkticketing.com/en/#/allEvents/detail?projectId=${projectId}`,
  }
};

https.get(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(d);
      console.log('JSON parsed successfully!');
      console.log('Project Name:', json.data?.projectName || json.data?.name);
      console.log('Full Data:', JSON.stringify(json.data, null, 2).substring(0, 2000));
    } catch {
      console.log('Raw body:', d.substring(0, 1000));
    }
  });
}).on('error', e => console.error(e));
