import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:43176';
const version = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url))).version;
const request = path => fetch(`${base}${path}`, { signal: AbortSignal.timeout(10_000) });
let ready = false;
for (let attempt = 0; attempt < 60; attempt++) {
  try {
    const health = await request('/api/health');
    if (health.ok) {
      ready = true;
      break;
    }
  } catch {}
  await delay(1000);
}
assert(ready, 'Container did not become healthy');

const results = [];
for (const [page, route, id] of [
  ['default', '/', 1],
  ['cert', '/cert', 2],
  ['ipc', '/ipc', 3],
]) {
  const response = await request(route);
  assert.equal(response.status, 200, `${page}: HTML status`);
  const html = await response.text();
  assert(html.includes(version) && html.includes('Uptime.Tips'), `${page}: branding/version`);
  assert(!html.includes('http://127.0.0.1:43161'), `${page}: private upstream URL leaked`);
  const monitorResponse = await request(`/api/monitor?pageId=${page}`);
  assert.equal(monitorResponse.status, 200);
  const monitor = await monitorResponse.json();
  assert.equal(monitor.success, true);
  assert.equal(monitor.monitorGroups[0].monitorList[0].id, id);
  const heartbeats = monitor.data.heartbeatList[id];
  assert.equal(heartbeats.length, 100, `${page}: all chart ranges need 100 samples`);
  assert(
    heartbeats.every(heartbeat => Number.isFinite(Date.parse(heartbeat.time))),
    `${page}: heartbeat times must be parseable by the chart`
  );
  const configResponse = await request(`/api/config?pageId=${page}`);
  assert.equal(configResponse.status, 200);
  const config = await configResponse.json();
  assert.equal(config.success, true);
  assert.deepEqual(
    config.pageTabs.map(tab => tab.id),
    ['default', 'cert', 'ipc']
  );
  assert.equal(config.config.icon, `/api/icon?pageId=${page}`);
  const icon = await request(`/api/icon?pageId=${page}`);
  assert.equal(icon.status, 200);
  assert(icon.headers.get('content-type')?.startsWith('image/'));
  assert((await icon.text()).includes('#17c964'), `${page}: uploaded icon replaced by fallback`);
  results.push({ page, html: 200, monitorId: id, tabs: 3, uploadedIcon: true });
}
console.log(JSON.stringify({ version, healthy: true, results }, null, 2));
