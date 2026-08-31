// Enkel lokal synkserver. Kör: node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const dataDirectory = path.join(root, 'data');
const dataFile = path.join(dataDirectory, 'lists.json');
const port = Number(process.env.PORT) || 3000;

function loadLists() {
  try { return JSON.parse(fs.readFileSync(dataFile, 'utf8')); } catch { return {}; }
}
function saveLists(lists) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(lists), 'utf8');
}
function send(response, status, body, type = 'application/json') {
  response.writeHead(status, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control':'no-store' });
  response.end(type === 'application/json' ? JSON.stringify(body) : body);
}
function readBody(request) {
  return new Promise((resolve, reject) => { let body = ''; request.on('data', chunk => body += chunk); request.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(); } }); });
}
http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const match = url.pathname.match(/^\/api\/lists\/([A-Za-z0-9_-]{4,40})$/);
  if (match) {
    const code = match[1], lists = loadLists();
    if (request.method === 'GET') return send(response, 200, { exists: Boolean(lists[code]), tasks: lists[code] || [] });
    if (request.method === 'PUT') {
      try { const body = await readBody(request); if (!Array.isArray(body.tasks)) return send(response, 400, { error:'Ogiltiga uppgifter.' }); lists[code] = body.tasks; saveLists(lists); return send(response, 200, { ok:true }); } catch { return send(response, 400, { error:'Ogiltig data.' }); }
    }
  }
  if (request.method !== 'GET') return send(response, 405, { error:'Metoden stöds inte.' });
  const filename = url.pathname === '/' ? 'index.html' : path.basename(url.pathname);
  const file = path.join(root, filename);
  if (!file.startsWith(root) || !fs.existsSync(file)) return send(response, 404, 'Hittades inte.', 'text/plain');
  const type = { '.html':'text/html', '.js':'application/javascript', '.json':'application/manifest+json', '.svg':'image/svg+xml' }[path.extname(file)] || 'application/octet-stream';
  send(response, 200, fs.readFileSync(file), type);
}).listen(port, '0.0.0.0', () => console.log(`Todo-appen kör på http://localhost:${port}`));
