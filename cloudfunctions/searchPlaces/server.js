const http = require('http');
const { URL } = require('url');
const { main } = require('./index');

const PORT = Number(process.env.PORT) || 9000;

function sendJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers
  });
  response.end(typeof payload === 'string' ? payload : JSON.stringify(payload));
}

const server = http.createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { success: true, service: 'weekend-radius-places' });
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { success: false, message: '仅支持 POST 请求' }, { Allow: 'POST' });
    return;
  }

  let body = '';
  request.setEncoding('utf8');
  request.on('data', (chunk) => {
    body += chunk;
    if (body.length > 64 * 1024) request.destroy();
  });
  request.on('end', async () => {
    try {
      const parsedUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      const result = await main({
        httpMethod: request.method,
        path: parsedUrl.pathname,
        headers: request.headers,
        queryStringParameters: Object.fromEntries(parsedUrl.searchParams.entries()),
        body,
        isBase64Encoded: false
      });
      sendJson(response, Number(result.statusCode) || 200, result.body || result, result.headers || {});
    } catch (error) {
      sendJson(response, 500, { success: false, message: '实时地点服务暂时不可用' });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Weekend Radius places service listening on ${PORT}`);
});
