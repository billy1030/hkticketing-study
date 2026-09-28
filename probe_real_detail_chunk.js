const https = require('https');

const url = 'https://g.alicdn.com/maizuo/mz-web/0.0.201/p__ticketSale__detail__index.async.js';
console.log('Downloading detail chunk from:', url);

https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Length:', d.length);
    // Find all APIs in detail chunk
    const apis = d.match(/\/api\/[a-zA-Z0-9_\/]+/g) || [];
    console.log('APIs in detail page chunk:', Array.from(new Set(apis)));

    // Look for how detail page queries the project:
    let p = 0;
    while ((p = d.indexOf('/api/', p)) !== -1) {
      console.log('API call snippet:', d.substring(Math.max(0, p - 60), Math.min(d.length, p + 160)));
      p += 6;
    }
  });
}).on('error', e => console.error(e));
