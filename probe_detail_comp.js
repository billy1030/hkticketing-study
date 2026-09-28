const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // 23: {title: "项目详情", path: "/allEvents/detail", parentId: "19", id: "23"}
    // Let's find routes matching route 23 or chunk for /allEvents/detail
    const p = data.indexOf('path:"/allEvents/detail"');
    console.log(data.substring(p - 100, p + 200));

    // Find chunk mapping: "23:function" or matching component
    const comp = data.indexOf('id:"23"');
    console.log('Comp:', data.substring(comp - 50, comp + 200));
  });
});
