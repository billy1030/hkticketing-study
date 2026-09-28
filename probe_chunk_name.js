const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find where 1950 chunk path is configured: e.g. "1950:"
    let p = 0;
    while ((p = data.indexOf('1950:', p)) !== -1) {
      console.log('1950 chunk path context:', data.substring(Math.max(0, p - 60), Math.min(data.length, p + 160)));
      p += 6;
    }
  });
});
