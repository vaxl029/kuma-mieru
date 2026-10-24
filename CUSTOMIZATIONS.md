# Uptime.Tips customizations

Baseline: production image 1.6.1, source `887999fe45bcfb506908e3e95e0f42b51d4a9024`.
Upstream target: v1.7.6, `60e261b068a1cf2fc3ca929d5d0de16351300df1`.

| ID | Behavior to preserve | Location | Acceptance |
| --- | --- | --- | --- |
| C001 | Uptime.Tips branding, copyright, original icons | config/defaults.ts, Footer, public | Correct title/footer; favicon.ico and icon.png retained |
| C002 | Home navigation, Home default tab; hide desktop search but keep mobile search | navbar.tsx, page-tabs.tsx | Subpages return to /; three tabs show distinct content |
| C003 | English fallback, configured UTC i18n timezone | utils/i18n, app/providers.tsx | Locale selection works; server/client receive the same configured timezone |
| C004 | User controls theme without upstream forcing it | AppShell.tsx | A user theme selection survives refresh/page changes |
| C005 | Online count / current page monitor count | SystemStatus.tsx, monitor-status.ts | Latest heartbeat, deduplication, pending/maintenance and unknown states covered |
| C006 | Scrollbar styling | styles/globals.css | Desktop scrollbar styled; tab strip still scrolls |
| C007 | Legacy FEATURE_* runtime configuration and default,cert,ipc | Dockerfile, upstream config loader | Runtime config replaces build config; no primary defaults shadow legacy values |
| C008 | Per-page uploaded icons behind internal Kuma service | app/api/icon/route.ts | FEATURE_ICON=/icon.svg remains a fallback; uploaded icons are served through /api/icon |

Legacy patches replaced by upstream: runtime filesystem config loading, per-page icon proxy, and accurate monitor status calculation. Do not restore the old window proxy switch or old env.ts client imports. USE_IMAGE_PROXY may remain in old Compose files but is unnecessary for the new /api/icon implementation.

CI exercises C005, C007, and C008 against synthetic Kuma fixtures. C001-C004 and C006 require browser checks on desktop/mobile before a production release. Synthetic checks do not verify the real server's network or data.
