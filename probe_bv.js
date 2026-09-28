const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find cr.bv definition (base url)
    const p = data.indexOf('function bv(');
    const p2 = data.indexOf('.bv=');
    console.log({ p, p2 });
    const idx = (p !== -1 ? p : p2);
    if (idx !== -1) {
      console.log('bv definition:');
      console.log(data.substring(idx - 100, idx + 400));
    }
  });
});
