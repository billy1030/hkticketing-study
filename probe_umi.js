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

async function findInUmi() {
  console.log('Downloading umi.js...');
  const umi = await download('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js');
  console.log('umi.js length:', umi.length);

  const apis = umi.match(/\/api\/[a-zA-Z0-9_\/]+/g) || [];
  console.log('APIs in umi.js:', Array.from(new Set(apis)).slice(0, 30));

  // Find chunks or webpack publicPath
  const chunks = umi.match(/[0-9a-zA-Z_\.\-]+\.async\.js/g) || [];
  console.log('Async chunks in umi.js:', Array.from(new Set(chunks)).slice(0, 20));

  const p = umi.indexOf('/api/');
  if (p !== -1) {
    console.log('Snippet around /api/:', umi.substring(p - 100, p + 200));
  }
}

findInUmi();
