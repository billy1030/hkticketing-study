const https = require('https');

function checkStatic() {
  const url = 'https://wr-static.maitix.com/check?projectId=1001';
  console.log('Probing:', url);
  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'X-User-Id': '12345678',
      'Referer': 'https://hkt.hkticketing.com/',
      'Origin': 'https://hkt.hkticketing.com'
    }
  }, (res) => {
    console.log('wr-static Status:', res.statusCode);
    console.log('wr-static Headers:', res.headers);
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('wr-static Body:', d));
  }).on('error', (e) => {
    console.error('wr-static Error:', e.message);
  });
}

checkStatic();
