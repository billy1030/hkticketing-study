const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const start = data.indexOf('17172:function');
    const end = data.indexOf('var Mt=st');
    console.log({ start, end });
  });
});
