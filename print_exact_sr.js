const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const start = data.indexOf('var sr=function(t){');
    const p = data.indexOf('return a(z)+a(f)+a(O)+a(d)}()', start);
    console.log(data.substring(start, p + 35));
  });
});
