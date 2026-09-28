const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find how chunk filenames are constructed: e.g. .async.js or .js
    const p = data.indexOf('"p__ticketSale__detail__index"');
    console.log(data.substring(p - 100, p + 200));

    // Look for .p +
    const u = data.indexOf('.async.js');
    console.log('.async.js:', u);

    // Look for chunk filename function: t + "." or ".js"
    let scriptPos = data.indexOf('script.src');
    if (scriptPos !== -1) {
      console.log('script.src snippet:');
      console.log(data.substring(scriptPos - 150, scriptPos + 150));
    }
  });
});
