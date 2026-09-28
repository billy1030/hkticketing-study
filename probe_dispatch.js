const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/p__ticketSale__detail__index.async.js', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    // Find where the dispatch or fetch for project detail is defined
    const pos = d.indexOf('project');
    let p = 0;
    while ((p = d.indexOf('dispatch({type', p)) !== -1) {
      console.log('Dispatch:', d.substring(p, p + 100));
      p += 14;
    }

    p = 0;
    while ((p = d.indexOf('getProject', p)) !== -1) {
      console.log('getProject:', d.substring(p - 20, p + 80));
      p += 10;
    }
  });
});
