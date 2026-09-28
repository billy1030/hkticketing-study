const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Search within 17172 for: headers[
    const start = data.indexOf('17172:function');
    const slice = data.substring(start, start + 30000);
    
    let p = 0;
    while ((p = slice.indexOf('headers[', p)) !== -1) {
      console.log('headers[...] snippet:', slice.substring(p - 60, p + 120));
      p += 8;
    }
  });
});
