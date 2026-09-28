const https = require('https');

function follow302() {
  const options = {
    hostname: 'rest-sig.imaitix.com',
    port: 443,
    path: '/api/pro/events?channelToken=76&serviceToken=&page=1&pageSize=20',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Origin': 'https://hkt.hkticketing.com',
      'Referer': 'https://hkt.hkticketing.com/',
    }
  };

  https.get(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Location header:', res.headers.location);
  });
}

follow302();
