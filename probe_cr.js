const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find cr definition in module 17172
    const start = data.indexOf('17172:function');
    const p = data.indexOf('(0,cr.bv)', start);
    console.log('pos of (0,cr.bv):', p);
    if (p !== -1) {
      console.log('Context of cr.bv:');
      console.log(data.substring(p - 100, p + 200));

      // Find cr = n(...)
      const crIdx = data.lastIndexOf('cr=n(', p);
      console.log('cr import:', data.substring(crIdx, crIdx + 50));
    }
  });
});
