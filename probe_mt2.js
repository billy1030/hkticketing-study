const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find where Mt is assigned: "Mt=" or "var Mt="
    const pos = data.indexOf('var Mt=');
    const pos2 = data.indexOf('Mt=function');
    const pos3 = data.indexOf('function Mt');
    console.log({ pos, pos2, pos3 });

    const targetPos = [pos, pos2, pos3].find(p => p !== -1) || data.lastIndexOf('Mt=', data.indexOf('return Mt') + 50000);
    console.log('Target pos:', targetPos);
    if (targetPos !== -1) {
      console.log(data.substring(targetPos, targetPos + 1000));
    }
  });
});
