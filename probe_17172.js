const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // 17172 is the interceptors module
    const pos = data.indexOf('17172:function');
    if (pos !== -1) {
      console.log('Module 17172 start:');
      console.log(data.substring(pos, pos + 2500));
    }
  });
});
