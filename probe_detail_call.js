const https = require('https');

function downloadUmi() {
  https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      // Find where "/allEvents/detail" routes to, or where projectId is requested
      const pos = data.indexOf('/allEvents/detail');
      console.log('Context of /allEvents/detail:');
      console.log(data.substring(pos - 100, pos + 300));

      // Find API that takes projectId or activityId:
      let p = 0;
      while ((p = data.indexOf('projectId:', p)) !== -1) {
        console.log('projectId param in API:', data.substring(Math.max(0, p - 80), Math.min(data.length, p + 100)));
        p += 10;
      }
    });
  });
}

downloadUmi();
