const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const start = data.indexOf('17172:function');
    const slice = data.substring(start, start + 30000);
    
    // Check definitions of ti, Yo, li, ai, oi, si, ui, zi, ni, ri, ei, Qo, pi, Jo, ii, Zo, Do
    const names = ['ti', 'Yo', 'li', 'ai', 'oi', 'si', 'ui', 'zi', 'ni', 'ri', 'ei', 'Qo', 'pi', 'Jo', 'ii', 'Zo', 'Do'];
    names.forEach(name => {
      const idx = slice.indexOf(`function ${name}(`);
      const idx2 = slice.indexOf(`${name}=function`);
      const idx3 = slice.indexOf(`var ${name}=`);
      const found = [idx, idx2, idx3].filter(i => i !== -1);
      if (found.length > 0) {
        const p = Math.min(...found);
        console.log(`=== ${name} ===`);
        console.log(slice.substring(p, p + 300));
      }
    });
  });
});
