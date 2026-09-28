const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Print snippet around "Vo.includes(e.url)"
    const pos = data.indexOf('Vo.includes(e.url)');
    console.log('Vo header injection:');
    console.log(data.substring(pos - 300, pos + 300));
  });
});
