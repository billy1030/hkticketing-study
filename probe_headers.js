const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find where headers are configured in module 17172: e.g. "headers"
    const p1 = data.indexOf('headers', data.indexOf('17172:function'));
    console.log('headers context:');
    console.log(data.substring(p1 - 200, p1 + 500));
  });
});
