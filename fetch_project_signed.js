const crypto = require('crypto');
const https = require('https');

// sr signature algorithm extracted from umi.js module 17172:
function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

function generateHecate(data, timestamp) {
  // e.epeius = String(t.t)
  // md5 implementation
  let obj = JSON.parse(JSON.stringify(data || {}));
  const keys = Object.keys(obj).sort();
  let result = {};
  keys.forEach(k => {
    result[k] = String(obj[k]);
  });
  result.epeius = String(timestamp);
  
  // Custom hash logic or standard md5 of query
  return md5(JSON.stringify(result));
}

async function tryFetchProject() {
  const projectId = '50000001568003';
  const now = Date.now();
  const rand = Math.floor(100 * Math.random());

  // Test combinations of headers from module 17172:
  // o._r = s; o.epeius = p; o.hecate = sr({data: n.params, t: p}); o.Site = "m"; o.coeus = "10086";
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
      'Site': 'm',
      'coeus': '10086',
      '_r': String(rand),
      'epeius': String(now),
      'X-Mz-Session': '',
      'Cookie': 'cna=mockCna123456789; acw_tc=a3b5239e17905608245305619e578cc4692398cd94c0226fe1fb57013e',
    }
  };

  https.get(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('Body:', d.substring(0, 500)));
  }).on('error', e => console.error(e));
}

tryFetchProject();
