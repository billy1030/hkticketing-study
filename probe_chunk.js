const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Look at 2000 chars before "var Mt=st"
    const end = 570479;
    const chunk = data.substring(end - 4000, end);
    
    // Find all occurrences of headers or interceptors in chunk
    let p = 0;
    while ((p = chunk.indexOf('interceptors', p)) !== -1) {
      console.log('Interceptors snippet:', chunk.substring(p - 100, p + 250));
      p += 12;
    }
  });
});
