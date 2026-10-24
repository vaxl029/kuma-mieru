# Build and deployment records

## Production baseline

The previous deployed version was 1.6.1 at https://uptime.tips/. The archived source revision is 887999fe45bcfb506908e3e95e0f42b51d4a9024; the previously observed multi-platform image digest is sha256:92419a664c5fcb5982ea6673065b464c2f32fd6fcf910f2015a14818804091aa. The running server image ID has not been inspected. Availability of the old registry artifact must be checked; do not rely on a future pull for rollback. Preserve the running server image and original Compose configuration before any deployment.

## Current release

Upstream: v1.7.6, commit 60e261b068a1cf2fc3ca929d5d0de16351300df1.
Custom version: release.json.
Build and exact image digest: successful Actions run summary and the corresponding custom/v<version> GitHub Release.
Architectures: linux/amd64 and linux/arm64, selected automatically by the combined image tag.
Compose example: docker-compose.uptime-tips.yml.

Publishing an image does not mean it has been deployed. No production deployment is recorded for this version.

## Deployment record template

```text
Date/environment:
Custom version:
Source SHA and upstream SHA:
Successful build URL:
Accepted image digest:
Configuration changes (no secrets):
Real-environment verification:
Previous image/configuration and data backup:
Rollback procedure:
Deployment result:
```
