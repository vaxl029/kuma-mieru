# Fork maintenance

## Sources and working branches

`upstream` is Alice39s/kuma-mieru; `origin` is vaxl029/kuma-mieru. The fork starts from upstream v1.7.6 (`60e261b068a1cf2fc3ca929d5d0de16351300df1`). `main` contains checked integration work; it does not indicate what is running in production.

Read this document, CUSTOMIZATIONS.md and DEPLOYMENTS.md before maintenance. Preserve uncommitted work. Use feature/<purpose>, fix/<purpose> or sync/upstream-<version> branches. Use ordinary project names and technical descriptions in commits, PRs, labels, comments and documentation. Do not add tool branding, tool authorship footers, private conversation links or session metadata. Before every commit, verify both author and committer against this repository's local Git identity: vaxl029 <huang971029@gmail.com>. Set repository-local user.name and user.email explicitly in a new clone; do not rely on global defaults. Retain upstream licensing and source attribution.

## Customization and upgrades

1. Confirm the latest stable upstream release and exact commit; do not assume the default branch is stable.
2. Identify the current customized source, deployed artifact and configuration. Save a rollback copy before migration.
3. Work from the fork's main branch, merge the upstream stable release, and adapt each CUSTOMIZATIONS.md entry. Prefer upstream functionality where it already solves an old patch.
4. Preserve history; do not reset away customization commits or accept all sides of a conflict blindly. Keep functional changes and unrelated formatting separate.
5. Run locked installation, lint, tests, configuration generation and typecheck. Verify branding, navigation, theme, icons and page data in a browser.
6. Review the diff and merge checked work into main. Never include credentials, private environment files or generated configuration.

## Build and release

All Actions workflows use workflow_dispatch only. Pushes, PRs, tags, releases and schedules do not start builds or scans. The maintainer runs Actions manually; another operator may dispatch a run only when explicitly asked. A source push alone is not authorization to start Actions. A manually requested image run executes all checks before publishing. Each native linux/amd64 and linux/arm64 build must pass container smoke checks before its digest is published. The combined image references those exact tested digests.

A manually requested run on main publishes the validated combined manifest under the custom version in release.json, the upstream version, its major/minor channels, latest and a source SHA tag. Other branches publish only unique candidate tags. All public version aliases select the host architecture automatically. The existing upstream Git tags are untouched; fork release tags use custom/v<custom-version>.

Increment release.json for every new published release, for example 1.7.6-custom.1 to 1.7.6-custom.2. Keep package.json at the actual upstream application version unless there is a deliberate application-version change. A published custom version is immutable; the workflow rejects assigning it to another digest. Version channels and latest may advance after validation. Formal tags reuse the verified image rather than rebuilding it.

Required checks: bun install --frozen-lockfile; bun run lint; bun test; fixture-backed bun run generate and bunx --no-install tsc --noEmit; native production image builds and scripts/ci/smoke-image.mjs. The mock checks configuration, three distinct status pages, monitor identity, health and uploaded icons. Browser acceptance remains necessary for visual behavior. The optional upstream ZAP scanner is manual; duplicate upstream test/release/version-bump workflows are replaced by the fork workflow. Dependency PRs require review and a custom release revision before integration; unattended dependency auto-merge is disabled.

## Deployment and rollback

A request to push and build does not authorize production deployment. Record the source SHA, successful workflow, accepted digest, configuration and previous artifact in deployment records. Keep the running image, configuration and any data backup before replacing a service. Deploy the already-tested digest, check health and real service behavior, and roll back to the saved artifact and matching configuration if necessary. Mock verification does not establish production network or data compatibility.
