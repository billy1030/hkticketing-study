const https = require('https');

https.get('https://g.alicdn.com/maizuo/mz-web/0.0.201/umi.js', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Find interceptor et.lm or headers added in request interceptors
    const pos = data.indexOf('st.interceptors.request.use(et.lm)');
    if (pos !== -1) {
      console.log('Snippet around request interceptors:');
      console.log(data.substring(pos - 600, pos + 800));
    }
  });
});
