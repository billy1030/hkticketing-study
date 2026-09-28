const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find where Vo is checked: e.g. Vo.some or Vo.includes
    let p = 0;
    while ((p = data.indexOf('Vo.', p)) !== -1) {
      console.log('Vo check:', data.substring(p - 60, p + 250));
      p += 4;
    }

    // Also check br in: br.some(function(t){return e.includes(t)})?"10010":"10086"
    const pBr = data.indexOf('br.some');
    console.log('br definition:');
    console.log(data.substring(pBr - 150, pBr + 150));
  });
});
