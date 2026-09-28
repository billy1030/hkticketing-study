const https = require('https');

function searchBigBang() {
  const query = encodeURIComponent('BIGBANG');
  const path = `/api/cms/homepage/siteDetail?keyword=${query}`;
  console.log('Searching BigBang on rest-sig.imaitix.com...');

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
    }
  };

  https.get(options, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', d.substring(0, 1500));
    });
  }).on('error', (e) => console.error('Error:', e.message));
}

searchBigBang();
