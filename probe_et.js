const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find et definition: "et="
    const end = 570479;
    const chunk = data.substring(end - 4000, end);
    const p = chunk.indexOf('et=');
    console.log('et definition snippet:');
    console.log(chunk.substring(p - 100, p + 500));
  });
});
