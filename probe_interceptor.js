const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find definition of li (exported as lm) in module 17172
    const pos = data.indexOf('function li(');
    const pos2 = data.indexOf('li=function');
    console.log({ pos, pos2 });

    const p = (pos !== -1 ? pos : pos2);
    if (p !== -1) {
      console.log('li function:');
      console.log(data.substring(p, p + 1000));
    }
  });
});
