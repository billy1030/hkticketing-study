const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const pos = data.indexOf('return Mt');
    if (pos !== -1) {
      console.log('Context of Mt:');
      console.log(data.substring(pos, pos + 2500));
    }
  });
});
