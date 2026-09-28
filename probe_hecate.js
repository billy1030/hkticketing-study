const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find how sr (hecate) is generated
    const start = data.indexOf('17172:function');
    const p = data.indexOf('o.hecate=', start);
    console.log('Context of hecate:');
    console.log(data.substring(p - 100, p + 300));

    // Find sr function definition within module 17172
    const srDef = data.lastIndexOf('function sr(', p);
    const srDef2 = data.lastIndexOf('sr=', p);
    console.log('sr definition in 17172:', data.substring(Math.max(srDef, srDef2) - 50, Math.max(srDef, srDef2) + 200));
  });
});
