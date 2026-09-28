const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Look for module 66419: "66419:function"
    const p = data.indexOf('66419:function');
    console.log('pos of module 66419:', p);
    if (p !== -1) {
      console.log('Module 66419:');
      console.log(data.substring(p, p + 2000));
    }
  });
});
