const https = require('https');

function testEvents() {
  // params: channelToken: 76, serviceToken: "", visibleToken: ""
  const path = '/api/pro/events?channelToken=76&serviceToken=&page=1&pageSize=20';
  console.log('Fetching:', path);

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
      'Accept-Language': 'zh-HK,zh;q=0.9',
    }
  };

  https.get(options, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const json = JSON.parse(d);
        console.log('Result count / code:', json.code, json.msg);
        console.log('Data sample:', JSON.stringify(json.data || json).substring(0, 1500));
      } catch {
        console.log('Raw body:', d.substring(0, 500));
      }
    });
  }).on('error', e => console.error(e.message));
}

testEvents();
