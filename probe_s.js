const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const p = 696965;
    console.log(data.substring(p + 1500, p + 3500));
  });
});
