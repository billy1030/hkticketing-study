const https = require('https');

function downloadChunk(chunkId) {
  return new Promise((resolve) => {
    const url = `https://g.alicdn.com/maizuo/mz-web/0.0.201/${chunkId}.js`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ chunkId, status: res.statusCode, length: data.length, content: data });
      });
    }).on('error', (e) => resolve({ chunkId, error: e.message }));
  });
}

async function analyze() {
  // 1950: detail, 1522: sellTicket, 2872: entry
  console.log('Fetching chunk 1950 (ticketSale detail)...');
  const res = await downloadChunk(1950);
  console.log(`Chunk 1950 status: ${res.status}, length: ${res.length}`);
  
  // Extract all API paths inside this chunk
  const matches = res.content.match(/\/api\/[a-zA-Z0-9_\/]+/g) || [];
  console.log('API Paths found in chunk 1950:', Array.from(new Set(matches)));

  // Let's also check chunk 1522 (sellTicket)
  console.log('Fetching chunk 1522 (sellTicket)...');
  const res2 = await downloadChunk(1522);
  const matches2 = res2.content.match(/\/api\/[a-zA-Z0-9_\/]+/g) || [];
  console.log('API Paths found in chunk 1522:', Array.from(new Set(matches2)));
}

analyze();
