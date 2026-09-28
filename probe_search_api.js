const https = require('https');

function downloadUmi() {
  https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      // Find search endpoints: e.g. "/api/pro/" or "keyword" or "search"
      let p = 0;
      while ((p = data.indexOf('/api/pro/', p)) !== -1) {
        console.log('Pro API context:', data.substring(Math.max(0, p - 60), Math.min(data.length, p + 160)));
        p += 9;
      }

      // Check search in ticketSale
      p = 0;
      while ((p = data.indexOf('search', p)) !== -1) {
        if (data.substring(p - 10, p + 20).includes('/api/')) {
          console.log('Search API:', data.substring(p - 20, p + 100));
        }
        p += 10;
      }
    });
  });
}

downloadUmi();
