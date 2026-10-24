import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolveAliasedEnvRaw } from './env-alias';
import { calculateMonitorStatusCounts } from './monitor-status';

test('status counts use the newest heartbeat and only the current page monitors', () => {
  const groups = [{ monitorList: [1, 2, 3, 4, 5].map(id => ({ id })) }];
  groups.push({ monitorList: [{ id: 1 }] });
  expect(
    calculateMonitorStatusCounts(groups, {
      1: [{ status: 0 }, { status: 1 }],
      2: [{ status: 1 }, { status: 0 }],
      3: [{ status: 2 }],
      4: [{ status: 3 }],
      99: [{ status: 1 }],
    })
  ).toEqual({ total: 5, up: 1, down: 1, pending: 1, maintenance: 1, unknown: 1, abnormal: 4 });
  expect(calculateMonitorStatusCounts([], {}).total).toBe(0);
});

test('Docker defaults do not shadow the existing FEATURE_* compose settings', () => {
  const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
  expect(dockerfile).not.toMatch(
    /(?:ARG|\s)KUMA_MIERU_(?:TITLE|ICON|EDIT_THIS_PAGE|SHOW_STAR_BUTTON)=/
  );
  expect(resolveAliasedEnvRaw('KUMA_MIERU_TITLE', { FEATURE_TITLE: 'Uptime.Tips' }).value).toBe(
    'Uptime.Tips'
  );
  expect(
    resolveAliasedEnvRaw('KUMA_MIERU_SHOW_STAR_BUTTON', { FEATURE_SHOW_STAR_BUTTON: 'false' }).value
  ).toBe('false');
  expect(
    resolveAliasedEnvRaw('KUMA_MIERU_TITLE', { FEATURE_TITLE: 'Old', KUMA_MIERU_TITLE: 'New' })
      .value
  ).toBe('New');
});
