const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find module 24169: "24169:function"
    const p = data.indexOf('24169:function');
    console.log('pos of 24169:', p);
    if (p !== -1) {
      console.log('Module 24169:');
      console.log(data.substring(p, p + 1000));
    }
  });
});
