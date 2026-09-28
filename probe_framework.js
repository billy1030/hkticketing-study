const https = require('https');

function download(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function findApiPrefix() {
  console.log('Downloading framework.js & umi.js...');
  const framework = await download('https://g.alicdn.com/maizuo/mz-web/0.0.201/framework.js');
  console.log('framework.js length:', framework.length);

  // Look for baseUrl or api prefix or mtop or gateway
  const apis = framework.match(/\/api\/[a-zA-Z0-9_\/]+/g) || [];
  console.log('APIs in framework.js:', Array.from(new Set(apis)).slice(0, 30));

  const domains = framework.match(/https?:\/\/[a-zA-Z0-9_\-\.]+\.(com|cn|hk)/g) || [];
  console.log('Domains in framework.js:', Array.from(new Set(domains)).slice(0, 20));
}

findApiPrefix();
