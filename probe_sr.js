const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find sr function definition: "sr=" or "function sr("
    const p1 = data.indexOf('function sr(');
    const p2 = data.indexOf('sr=function');
    const p3 = data.indexOf('var sr=');
    console.log({ p1, p2, p3 });

    const p = [p1, p2, p3].find(idx => idx !== -1);
    if (p !== -1) {
      console.log('sr definition:');
      console.log(data.substring(p, p + 1000));
    }
  });
});
