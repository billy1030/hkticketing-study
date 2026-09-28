const https = require('https');
const crypto = require('crypto');

// Standard MD5 function that matches the JS MD5 implementation in umi.js
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function computeHecate(params, timestamp) {
  let e = {};
  Object.keys(params).sort().forEach(k => {
    e[k] = String(params[k]);
  });
  e.epeius = String(timestamp);
  return md5(JSON.stringify(e));
}

async function fetchProject() {
  const projectId = '50000001568003';
  const now = Date.now();
  const rand = Math.floor(100 * Math.random());
  const params = { projectId };
  const hecate = computeHecate(params, now);

  const options = {
    hostname: 'rest-sig.imaitix.com',
    port: 443,
    path: `/api/pro/project?projectId=${projectId}`,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://hkt.hkticketing.com',
      'Referer': `https://hkt.hkticketing.com/en/#/allEvents/detail?projectId=${projectId}`,
      'project-id': projectId,
      'Site': 'm',
      'coeus': '10086',
      '_r': String(rand),
      'epeius': String(now),
      'hecate': hecate,
    }
  };

  https.get(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Location:', res.headers.location);
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('Response:', d.substring(0, 500)));
  }).on('error', e => console.error(e));
}

fetchProject();
