const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Search for definition of module 14341: "14341:function"
    const pos = data.indexOf('14341:function');
    if (pos !== -1) {
      console.log('Module 14341 definition:');
      console.log(data.substring(pos, pos + 1500));
    } else {
      console.log('14341 not found directly, searching 14341:');
      let p = 0;
      while ((p = data.indexOf('14341', p)) !== -1) {
        console.log('Match at', p, ':', data.substring(p - 20, p + 50));
        p += 5;
      }
    }
  });
});
