# Status view regression checks

Related upstream report: https://github.com/Alice39s/kuma-mieru/issues/292.

The upstream discussion reports a fix for full/detail views in 1.6.9, while compact views intentionally omitted latency and legends. This fork also shows these details in compact mode and removes the viewport rule that hid latency at widths of 1024px and below. Headers use normal document flow and wrap instead of overlapping the heartbeat bar.

## Local fixture

Use `scripts/ci/mock-kuma.mjs` on port 43161 with `UPTIME_KUMA_BASE_URL=http://127.0.0.1:43161`, `PAGE_ID=default,cert,ipc`, `FEATURE_TITLE=Uptime.Tips`, and `TIMEZONE=UTC`. Generate configuration, build and start the application locally. The fixture's latest and average online latency are both 24 ms. It uses synthetic data and does not contact production.

## Browser acceptance

At desktop width, and again at 320px, 390px and 768px:

1. Open the home page and select compact view. Confirm LT and AL both show 24 ms, all four status legend labels are visible, and the heartbeat bar sits below them.
2. Reload. Compact mode must persist with the same statistics and legend.
3. Switch to full view. Confirm the statistics, legend and chart are visible.
4. Switch back to compact view, then open the monitor. Confirm the detail view shows latest, average and trimmed average latency plus the legend.
5. Reload the detail page. Confirm the information remains visible.
6. Check for horizontal page overflow, overlapping text and browser console errors. Narrow layouts may wrap the statistics or legend onto another row.
7. Check all three page tabs: rounded icons remain visible with no small status dot overlay. Verify that each tab still opens its own monitor data.
8. Use 100 heartbeat samples so all four chart ranges are available. Select each range and verify the selected state, plotted curve and time axis update. At 320px the buttons wrap into two rows.
9. Resize a loaded detail page from 1280px directly to 320px without refreshing. Check the card body as well as the whole page: its scroll width must not exceed its client width, and the chart must fit inside it. Do not mistake intentionally clipped status-banner decorations or the horizontally scrollable page tabs for card overflow.

If the upstream heartbeat history has no usable ping samples, latency statistics can be absent; the layout change does not fabricate measurements. Status legends still display.

Run lint, unit tests, configuration generation, typecheck, production build and `scripts/ci/smoke-image.mjs` as well. Browser checks are required because unit tests alone cannot establish responsive layout or behavior after navigation and refresh. Container checks for both architectures run only when the maintainer explicitly requests the manual image workflow.

## Verification for 1.7.6-custom.2

On 2026-10-25, locked installation, lint, all four existing unit tests, fixture configuration generation, typecheck and the local production build passed. The HTTP smoke script passed against the standalone build for default, cert and ipc. Chrome checks passed for compact refresh, full-view switching and detail navigation/refresh at desktop, 390px and 768px widths. No browser console errors were observed. All three tab images loaded without an overlay. Native amd64/arm64 image builds and production deployment remain pending the manual release workflow.

This first pass established statistics visibility, but missed internal chart overflow after resizing and did not cover 320px or all four range buttons. It is not sufficient evidence of a complete responsive layout check.

## Narrow-screen follow-up for 1.7.6-custom.3

Reproduced a detail card body with 230px client width and 282px scroll width at a 320px viewport. The chart and range controls extended past the right edge. Grid tracks now permit shrinking, chart controls wrap to available width, mobile full/detail headers use separate rows, and refresh/footer text wraps without squeezing words into narrow columns.

The fixture now provides 100 samples in Kuma's timestamp format. HTTP smoke checks assert the sample count and parseable timestamps. Chrome checks at 320px, 390px, 768px and 1280px confirmed no internal horizontal overflow in the detail card, a rendered chart curve, working range selection, and successful desktop-to-mobile resizing without reload. Compact refresh and switching back to full view were also checked. Local lint, unit tests, typecheck, production build and three-page smoke checks passed. No image build or deployment was requested as part of this follow-up.
