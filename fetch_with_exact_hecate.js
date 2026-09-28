const https = require('https');

// Pure extraction of sr from umi.js
var sr=function(t){t.data=t.data||{},"string"==typeof t.data?t.data=JSON.parse(t.data):t.data=JSON.parse(JSON.stringify(t.data)),t.t=t.t||(new Date).getTime().toString();var e=function t(e){var n=typeof e;if(["string","boolean","number","undefined"].indexOf(n)>-1)return String(e);if(null==e)return"null";var r=JSON.parse(JSON.stringify(e)),o=Object.keys(r).sort(),i="[object array]"===Object.prototype.toString.call(r).toLowerCase(),c=i?[]:new Object(null);return o.forEach((function(e){if("[object object]"===Object.prototype.toString.call(r[e]).toLowerCase())i?c.push(t(r[e])):c[e]=t(r[e]);else if("[object array]"===Object.prototype.toString.call(r[e]).toLowerCase()){var n=r[e].map((function(e){return t(e)}));i?c.push(n):c[e]=n}else null==r[e]?i?c.push("null"):c[e]="null":i?c.push(r[e].toString()):c[e]=r[e].toString()})),c}(t.data);return"[object object]"===Object.prototype.toString.call(e).toLowerCase()?e.epeius=String(t.t):"[object array]"===Object.prototype.toString.call(e).toLowerCase()?e.push(String(t.t)):e+=String(t.t),function(t){function e(t,e){return t<<e|t>>>32-e}function n(t,e){var n,r,o,i,c;return o=2147483648&t,i=2147483648&e,c=(1073741823&t)+(1073741823&e),(n=1073741824&t)&(r=1073741824&e)?2147483648^c^o^i:n|r?1073741824&c?3221225472^c^o^i:1073741824^c^o^i:c^o^i}function r(t,r,o,i,c,a,p){var u=n(t,n(n(function(t,e,n){return t&e|~t&n}(r,o,i),c),p));return n(e(u,a),r)}function o(t,r,o,i,c,a,p){var u=n(t,n(n(function(t,e,n){return t&n|e&~n}(r,o,i),c),p));return n(e(u,a),r)}function i(t,r,o,i,c,a,p){var u=n(t,n(n(function(t,e,n){return t^e^n}(r,o,i),c),p));return n(e(u,a),r)}function c(t,r,o,i,c,a,p){var u=n(t,n(n(function(t,e,n){return e^(t|~n)}(r,o,i),c),p));return n(e(u,a),r)}function a(t){var e,n="",r="";for(e=0;e<=3;e++)n+=(r="0"+(t>>>8*e&255).toString(16)).substr(r.length-2,2);return n}var p,u,s,b,M,l,z,f,O,d;for(p=function(t){for(var e,n=t.length,r=n+8,o=16*((r-r%64)/64+1),i=Array(o-1),c=0,a=0;a<n;)c=a%4*8,i[e=(a-a%4)/4]=i[e]|t.charCodeAt(a)<<c,a++;return c=a%4*8,i[e=(a-a%4)/4]=i[e]|128<<c,i[o-2]=n<<3,i[o-1]=n>>>29,i}(function(t){for(var e=t.replace(/\r\n/g,"\n"),n="",r=0;r<e.length;r++){var o=e.charCodeAt(r);o<128?n+=String.fromCharCode(o):o>127&&o<2048?(n+=String.fromCharCode(o>>6|192),n+=String.fromCharCode(63&o|128)):(n+=String.fromCharCode(o>>12|224),n+=String.fromCharCode(o>>6&63|128),n+=String.fromCharCode(63&o|128))}return n}(typeof e === "string" ? e : JSON.stringify(e))),z=1732584193,f=4023233417,O=2562383102,d=271733878,u=0;u<p.length;u+=16)s=z,b=f,M=O,l=d,z=r(z,f,O,d,p[u+0],7,3614090360),d=r(d,z,f,O,p[u+1],12,3905402710),O=r(O,d,z,f,p[u+2],17,606105819),f=r(f,O,d,z,p[u+3],22,3250441966),z=r(z,f,O,d,p[u+4],7,4118548399),d=r(d,z,f,O,p[u+5],12,1200080426),O=r(O,d,z,f,p[u+6],17,2821735955),f=r(f,O,d,z,p[u+7],22,4249261313),z=r(z,f,O,d,p[u+8],7,1770035416),d=r(d,z,f,O,p[u+9],12,2336552879),O=r(O,d,z,f,p[u+10],17,4294925233),f=r(f,O,d,z,p[u+11],22,2304563134),z=r(z,f,O,d,p[u+12],7,1804603682),d=r(d,z,f,O,p[u+13],12,4254626195),O=r(O,d,z,f,p[u+14],17,2792965006),z=o(z,f=r(f,O,d,z,p[u+15],22,1236535329),O,d,p[u+1],5,4129170786),d=o(d,z,f,O,p[u+6],9,3225465664),O=o(O,d,z,f,p[u+11],14,643717713),f=o(f,O,d,z,p[u+0],20,3921069994),z=o(z,f,O,d,p[u+5],5,3593408605),d=o(d,z,f,O,p[u+10],9,38016083),O=o(O,d,z,f,p[u+15],14,3634488961),f=o(f,O,d,z,p[u+4],20,3889429448),z=o(z,f,O,d,p[u+9],5,568446438),d=o(d,z,f,O,p[u+14],9,3275163606),O=o(O,d,z,f,p[u+3],14,4107603335),f=o(f,O,d,z,p[u+8],20,1163531501),z=o(z,f,O,d,p[u+13],5,2850285829),d=o(d,z,f,O,p[u+2],9,4243563512),O=o(O,d,z,f,p[u+7],14,1735328473),f=o(f,O,d,z,p[u+12],20,2368359562),z=i(z,f=o(f,O,d,z,p[u+1],5,4129170786),O,d,p[u+5],4,4294925233),d=i(d,z,f,O,p[u+8],11,3225465664),O=i(O,d,z,f,p[u+11],16,643717713),f=i(f,O,d,z,p[u+14],23,3921069994),z=c(z,f,O,d,p[u+0],6,3593408605),d=c(d,z,f,O,p[u+7],10,38016083),O=c(O,d,z,f,p[u+14],15,3634488961),f=c(f,O,d,z,p[u+5],21,3889429448),z=n(z,s),f=n(f,b),O=n(O,M),d=n(d,l);return a(z)+a(f)+a(O)+a(d)}()};

async function testFetch() {
  const projectId = '50000001568003';
  const now = Date.now();
  const rand = Math.floor(100 * Math.random());
  const params = { projectId };
  const hecate = sr({ data: params, t: now });
  console.log('Generated exact hecate signature:', hecate);

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
      'hecate': hecate,
      'project-id': projectId,
      'X-Mz-Session': '',
    }
  };

  https.get(options, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log('Response body:', d.substring(0, 1500));
    });
  }).on('error', e => console.error(e));
}

testFetch();
