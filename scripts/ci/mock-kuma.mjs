import http from 'node:http';
const pages = { default: [1, 'Uptime.Tips'], cert: [2, 'Certificates'], ipc: [3, 'IPC'] };
const icon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#17c964"/></svg>';
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const id = url.pathname.split('/').at(-1);
  const page = pages[id];
  const send = (body, type = 'application/json', status = 200) => {
    res.writeHead(status, { 'Content-Type': type });
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
  };
  if (url.pathname.startsWith('/upload/')) return send(icon, 'image/svg+xml');
  if (!page) return send({ error: 'not found' }, 'application/json', 404);
  const [monitorId, title] = page;
  if (url.pathname.startsWith('/api/status-page/heartbeat/')) {
    return send({
      heartbeatList: {
        [monitorId]: Array.from({ length: 100 }, (_, index) => ({
          status: index === 0 ? 0 : 1,
          time: new Date(Date.UTC(2026, 9, 24, 0, index))
            .toISOString()
            .slice(0, 19)
            .replace('T', ' '),
          ping: index === 0 ? 0 : 24,
        })),
      },
      uptimeList: { [`${monitorId}_24`]: 0.99 },
    });
  }
  const data = {
    config: {
      slug: id,
      title,
      description: `${title} status`,
      icon: `/upload/${id}.svg`,
      theme: 'dark',
      published: true,
      showTags: true,
      customCSS: '',
      footerText: '',
      showPoweredBy: false,
      googleAnalyticsId: null,
      showCertificateExpiry: true,
    },
    publicGroupList: [
      {
        id: monitorId,
        name: `${title} group`,
        weight: 1,
        monitorList: [
          {
            id: monitorId,
            name: `${title} monitor`,
            type: 'http',
            weight: 1,
            tags: [],
            url: 'https://example.com',
            interval: 60,
          },
        ],
      },
    ],
    maintenanceList: [],
    incidents: [],
  };
  if (url.pathname.startsWith('/api/status-page/')) return send(data);
  return send(
    `<!doctype html><html><head><title>${title}</title></head><body><script id="preload-data" type="application/json">${JSON.stringify(data)}</script></body></html>`,
    'text/html'
  );
});
server.listen(43161, '127.0.0.1', () => console.log('Mock Kuma listening on 127.0.0.1:43161'));
