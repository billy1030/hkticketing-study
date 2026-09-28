const fs = require('fs');

function searchUmi() {
  const umi = fs.readFileSync('C:/ai/hkticketing-study/probe_umi.js'); // check if saved
}

const https = require('https');
https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find how requests are sent: axios, fetch, or mtop
    const pos = data.indexOf('/api/cms/homepage/siteDetail');
    if (pos !== -1) {
      console.log('Context of siteDetail:');
      console.log(data.substring(pos - 300, pos + 300));
    }

    const posReq = data.indexOf('baseURL');
    if (posReq !== -1) {
      console.log('baseURL snippet:');
      console.log(data.substring(posReq - 100, posReq + 200));
    }
  });
});
