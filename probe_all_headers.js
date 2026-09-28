const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find interceptors functions: ti, Yo, Qo, pi, etc.
    const start = data.indexOf('17172:function');
    const end = data.indexOf('var Mt=st');
    const slice = data.substring(start, end);
    
    // Look for occurrences of .headers in slice
    let p = 0;
    while ((p = slice.indexOf('headers', p)) !== -1) {
      console.log('--- match at', p, '---');
      console.log(slice.substring(Math.max(0, p - 80), Math.min(slice.length, p + 180)));
      p += 10;
    }
  });
});
