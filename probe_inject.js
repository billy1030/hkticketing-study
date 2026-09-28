const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const start = data.indexOf('17172:function');
    const p = start + 105300;
    console.log('Interceptors request header injection snippet:');
    console.log(data.substring(p, p + 1600));
  });
});
