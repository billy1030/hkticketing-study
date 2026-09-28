const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const pos = 570479;
    console.log('Snippet before 570479:');
    console.log(data.substring(pos - 1500, pos));
  });
});
