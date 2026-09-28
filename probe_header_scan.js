const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const start = data.indexOf('17172:function');
    // find next module ",\d+:function"
    const nextMod = data.slice(start + 50).search(/,\d+:function/);
    console.log('Module 17172 length:', nextMod);
    const slice = data.substring(start, start + 50 + nextMod);
    
    // Search for headers in slice
    const matches = slice.match(/[a-zA-Z0-9_\$]+\.headers/g) || [];
    console.log('Matches for .headers in 17172:', Array.from(new Set(matches)));

    // Search for common header names in slice
    const headerKeywords = ['X-', 'x-', 'mz-', 'Authorization', 'token', 'Account', 'Terminal', 'City', 'Platform'];
    headerKeywords.forEach(kw => {
      let p = 0;
      while ((p = slice.indexOf(kw, p)) !== -1) {
        console.log(`Keyword [${kw}] at ${p}:`, slice.substring(Math.max(0, p - 40), Math.min(slice.length, p + 100)));
        p += kw.length + 5;
      }
    });
  });
});
