const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Look for Vo array in 17172 (apis that require special headers)
    const p = data.indexOf('Vo=[');
    console.log('Vo array:');
    console.log(data.substring(p - 100, p + 500));
  });
});
