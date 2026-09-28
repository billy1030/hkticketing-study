const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const start = data.indexOf('var sr=function(t){');
    console.log('sr implementation:');
    console.log(data.substring(start, start + 1500));
  });
});
