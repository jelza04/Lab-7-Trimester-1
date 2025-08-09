const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

function loadGoods() {
  const data = fs.readFileSync('./handmade_goods.json', 'utf8');
  return JSON.parse(data);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathName = parsedUrl.pathname;
  const query = parsedUrl.query;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve images from public/images/
  if (pathName.startsWith('/public/')) {
  const filePath = path.join(__dirname, pathName);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
  return;
}


  // API endpoint
  if (pathName === '/api') {
    let goods = loadGoods();

    if (query.item) {
      goods = goods.filter(g => g.name.toLowerCase().includes(query.item.toLowerCase()));
    }
    if (query.price) {
      goods = goods.filter(g => g.price <= parseFloat(query.price));
    }
    if (query.category) {
      goods = goods.filter(g => g.category.toLowerCase() === query.category.toLowerCase());
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(goods));
    return;
  }

  // 404 fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
