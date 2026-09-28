const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/p__ticketSale__detail__index.async.js', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    // Print lines around /api/pro/project
    const pos = d.indexOf('/api/pro/project');
    console.log('Snippet around /api/pro/project:');
    console.log(d.substring(Math.max(0, pos - 400), Math.min(d.length, pos + 800)));
  });
});
