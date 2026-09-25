# AWS hackathon preview

Type: how-to/reference. C09 preparation, 2026-09-24.

## Current deployed preview (2026-09-24)

The AWS preview is publicly accessible at `https://d2g4a2ezl5lw7r.cloudfront.net/career` after the owner requested removing reviewer Basic Auth. The EC2 host is in Sydney (`ap-southeast-2`); the CloudFront VPC origin has no public inbound EC2 port. The current cloud image is `learnsprint:preview-c09-actorfix-20260924`, built on the host and observed healthy on 2026-09-25. Unauthenticated HTTPS entry, home API and health checks returned 200 after the public access update. Chrome rendered First Shift without a sign-in prompt; the repaired build preserved one contact desk during proposal Apply/Undo. The initial release receipt is in `docs/delivery/AWS-PREVIEW-2026-09-24.json`; current observations are in `docs/delivery/STATUS.md`.

Hosted career AI is explicitly enabled using separate preview batches: Lite 10 reservations/$0.20 and Sonic four reservations/$1. The latest 2026-09-25 ledger query found eight Lite reservations (four completed, four closed or uncertain) and three Sonic reservations (all closed or uncertain). A saved factual warehouse reply, coaching focus and explicit allocation proposal were observed; hosted Sonic has no successful browser voice receipt. The local and historical ledgers were preserved. The host uses an instance role restricted to the required Nova resources. Full microphone acceptance remains open. No local application tests or local Docker build were run, per the owner's preference.

The steps below document a fresh deployment; they do not reset the running preview or its invocation ledger.

## Current cloud release

The owner requested cloud builds and no local tests, and selected a CloudFront-issued HTTPS URL. The cloud release uses the assigned project region **ap-southeast-2 (Sydney)**. EC2 in us-east-1 is denied by this project's region policy; do not change that policy or upgrade the account to deploy this application. AWS Settings → Projects → Additional information shows the assigned region. The existing Bedrock inference configuration can use its separately permitted region.

The release is deployed. Actual results are recorded in [status](../docs/delivery/STATUS.md). The earlier preparation description below is historical.

Cloud variant:

```text
Browser → CloudFront HTTPS (*.cloudfront.net), no caching
        → CloudFront VPC origin / private network
        → Caddy :8080, required origin secret; no reviewer Basic Auth
        → app:3001, required private proxy header + exact HTTPS Origin
        → SQLite on encrypted EBS
```

`Caddyfile.cloudfront` is used only behind a CloudFront VPC origin. Its HTTP listener must never be exposed to arbitrary Internet clients. The EC2 security group permits port 8080 only from AWS's managed CloudFront VPC-origin security group; no SSH ingress. The host's public IPv4 is for outbound package downloads and AWS service access. CloudFront reaches the private instance DNS/IP. Preserve these ingress restrictions even though the host resides in a default subnet with an Internet route.

Set `LEARNSPRINT_CADDY_CONFIG=Caddyfile.cloudfront`, `LEARNSPRINT_GATEWAY_HTTP_PORT=8080`, `LEARNSPRINT_GATEWAY_HTTPS_PORT=127.0.0.1:8443`, and the issued distribution domain. CloudFront uses Managed-CachingDisabled and Managed-AllViewer (including Authorization, Origin, cookies, and WebSocket headers), HTTPS-only viewers, and overwrites `X-LearnSprint-Origin` with the private origin token. Caddy checks that token and strips viewer Authorization before forwarding to the app. Application preview host/origin checks remain enabled. The extra HTTPS mapping is bound to loopback and unused by this variant.

`bootstrap-ubuntu.sh` installs Docker from its official Ubuntu repository **on a fresh EC2 host only** and adds 2 GiB swap for cloud compilation. Source archives are private S3 objects with server-side encryption. The SSM build command downloads an expiring signed object URL, checks SHA-256, resolves official Node/Caddy image digests and builds the image on EC2. Private command payloads, IDs and credentials are excluded under `deploy/private/`. Never print signed URLs or secret-bearing CloudFront configs into a public build log.

The 30 GiB encrypted gp3 root volume is retained on instance termination and contains `/var/lib/learnsprint/data`. It remains billable after stopping or terminating the host. Keep the volume and invocation history until an explicit teardown decision; it is not a backup. No local learner database is copied. The first cloud configuration disables inference until the live career allowance/instance policy is configured deliberately.

Current pre-tax base estimate at 730 hours: t3.small $19.272 + gp3 $2.88 + IPv4 $3.65 = **$25.802/month**, excluding transfer, S3, snapshots and inference. Observed Free-plan credit: $120 on 2026-09-24; the separate $150 voucher is not counted. Standard CPU credits avoid T3 Unlimited surplus charges. Host role initially has SSM management only, not administrator or model invocation rights.

References: [assigned project regions](https://docs.aws.amazon.com/accounts/latest/reference/project-regions.html), [CloudFront VPC origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-vpc-origins.html), [WebSocket forwarding](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-working-with.websockets.html), [Docker Ubuntu installation](https://docs.docker.com/engine/install/ubuntu/).

## Earlier source preparation

The API/web source compiles. The Dockerfile, Compose and gateway configuration below are authored but have **not** been built or run in Docker: Docker is not installed on the current development machine. No AWS resources, DNS changes, account upgrades, credentials, new model allowance or public release were created. No application tests or journey checks were run.

## Concrete first hosting design

```text
Browser → HTTPS → Caddy on one AWS EC2 machine
                                      ↓ private container network
                            Nest API + built React + career WebSocket
                                      ↓                 ↓
                            persistent SQLite       Bedrock via IAM role
```

One Node process preserves current SQLite transactions, local invocation caps and WebSocket ownership. The first preview should use one Linux machine with at least 2 GiB memory, a persistent encrypted EBS data directory and a public DNS name controlled by the owner. Exact instance/account/region eligibility, current price, storage size, credit coverage and DNS are release decisions still to resolve. The existing broader Lambda/DynamoDB/AgentCore architecture remains a later option, not a prerequisite for a useful demo.

The current CloudFront variant checks a private origin token before forwarding. It does not require a reviewer password. Each browser receives a random career capability cookie; saved shifts remain browser-bound and cannot be recovered on another device. The publicly accessible demo is not a production identity service.

The app requires an exact HTTPS origin, a private 64-hex proxy token and an absolute data directory in preview mode. It validates both HTTP and WebSocket requests against this configuration. Browser POSTs require a matching Origin. Career cookies use Secure/HttpOnly/SameSite. The app exposes only career routes plus required static/audio assets; legacy local prototypes remain in the source but their APIs are not registered in preview mode.

## What is included

| File | Purpose |
| --- | --- |
| `../Dockerfile` | Separate dependency/build/runtime stages, frozen pnpm lockfile, non-root Node runtime |
| `../.dockerignore` | Exclude local data, credentials, environment files and build products |
| `compose.preview.yaml` | App without published ports; Caddy 80/443; persistent bind mount and certificate volumes; bounded logs/memory |
| `Caddyfile.cloudfront`, `gateway-start.sh` | Private origin token check, proxy header, WebSocket forwarding; no viewer password |
| `.env.example` | Non-secret deployment placeholders; not a configured live hostname |
| `career-ai.disabled.json` | Default no-inference configuration for an initial preview |
| `healthcheck.mjs` | Local container readiness; no model call or learner data mutation |
| `../scripts/package-preview.mjs` | Explicit source allowlist, archive and SHA-256; no local data or AWS files |

Node `26.6.0-bookworm-slim`, pnpm `10.33.0` and Caddy `2.10.2-alpine` are explicit intended build inputs. Docker image availability and digests have not been resolved. Build on the target architecture and pin resolved image digests in the release receipt before deployment. Do not claim the source tarball is a built image or a fully reproducible release yet.

## Prepare release and private host files

On a machine with the required Node version, the baseline runs without AWS credentials:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Open `http://127.0.0.1:3001/career`. Build success alone does not verify application behavior. Local databases remain in `.data` and must not be committed or uploaded as part of source.

To create a source archive from the full repository:

```sh
node scripts/package-preview.mjs preview-c09-20260924
```

On the selected EC2 host, install Docker Engine and Compose from their supported distribution instructions. Use an encrypted persistent EBS volume mounted before starting containers. Mount the application directory as `/var/lib/learnsprint/data`; do not store it inside the image. Make the directory writable by container UID 1000. Keep one app replica; restarting with an empty directory would lose learner state and invocation history.

Create a private directory outside the source checkout, e.g. `/var/lib/learnsprint/private`, readable only by the operator and required container users. Prepare:

1. `proxy-token`: 32 cryptographically random bytes encoded as 64 lowercase hexadecimal characters, readable by app UID 1000 and gateway. Never paste it into a ticket, chat, repository or command-line argument.
2. No viewer password file is required for the current CloudFront variant. The following Basic Auth example applies only to the earlier private preview design and is not mounted by the current Compose configuration.

```caddyfile
basic_auth {
    reviewer <generated-bcrypt-hash>
}
```

The example above is historical and not used by the current public CloudFront preview. Keep the proxy token private and rotate gateway/app together if it changes.

Copy `career-ai.disabled.json` into the data directory as `career-ai-config.json` **only for a new preview data directory**. Never overwrite an existing live allowance or copy a local database that contains user records without a deliberate migration decision.

Copy `.env.example` into a private environment file. Set the exact domain, absolute data/private paths and immutable image tag. Use a public DNS name pointing to the chosen stable instance address. Caddy requires reachable 80/443 for its normal public certificate flow and persistent certificate storage. [Automatic HTTPS documentation](https://caddyserver.com/docs/automatic-https).

From the extracted source root, once the hostname/private files are ready:

```sh
docker compose --env-file /absolute/private/preview.env -f deploy/compose.preview.yaml build app
docker compose --env-file /absolute/private/preview.env -f deploy/compose.preview.yaml up -d
```

These commands are documented, not executed. The Compose service depends on app health; readiness does not validate login, cookies, voice or a complete shift.

## AWS authentication and costs

Keep long-lived AWS keys and the developer's `~/.aws` directory out of containers. Career AI configuration now permits omission of `awsProfile`, allowing the AWS SDK credential chain to use an attached instance role. Existing local profile-based configuration and its ledger serialization remain unchanged. [AWS credential providers](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrate-credential-providers.html).

Attach a role scoped to the actual Nova model/inference profile routes only after confirming the account's model access. For container access to EC2 metadata, require IMDSv2 and account for the container network hop limit; AWS discusses using hop limit 2 for container environments. [EC2 metadata options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-options.html).

No hosted live allowance is enabled by these files. A release must explicitly decide whether to migrate the existing ledger and configuration together or allocate a separate bounded batch under the active authorization. Never copy configuration alone into an empty ledger and call that preserving a used allowance. Never restore an older invocation ledger simply to retry calls. Authored/manual mode remains available with AI disabled.

Recurring cost categories: instance runtime, EBS, public IPv4, transfer, optional snapshot storage and enabled Bedrock calls. This document makes no current price or free-tier claim. Check the exact account plan, credit redemption/expiry, chosen instance quote and a bounded hosting allocation before provisioning. Stopping EC2 does not stop EBS/address/snapshot charges.

## Release acceptance and access

Still required before calling this a working hosted demo:

- A requested full career/replay/help/report acceptance pass, followed by real Lite/Sonic observation under the existing allowance.
- A Docker build on the intended CPU architecture and configuration validation.
- Fresh AWS account/role/model access, quoted cost envelope, chosen DNS and HTTPS certificate evidence.
- An observed public HTTPS entry, Secure cookie isolation between browsers, correct host/origin checks and voice upgrade through Caddy. The public entry is observed; full browser cookie isolation and voice upgrade remain open.
- Restart/pause/resume, independent-to-assisted boundary, report/download and persistent ledger behavior.
- A resource/release receipt: instance/volume/address/DNS IDs, image digest, source checksum, private-config location (never values), region, owner, actual deployed URL, observed checks and rollback reference.

No outreach, judge invite or Devpost edit is performed by this configuration. The final submission needs a functioning video, source/setup/license and the appropriate Devpost fields. Alexa+ permits a locally runnable repo plus demo video without hosting. [Official FAQ](https://amazonappdev2026.devpost.com/details/faqs).

## Backup, rollback and teardown

For a consistent cold backup, stop the gateway first to close new traffic, then stop the app. Copy the entire persistent data directory (including SQLite WAL/SHM if present and **all invocation ledgers**) to an encrypted backup with a timestamp. Restart app/gateway after the copy. Do not copy only the main SQLite file while writes are active.

Rollback the application image while preserving the current data and ledgers. Check code/data compatibility before selecting an older release. Restoring a database backup is a separate recovery action and must reconcile any inference reservations made since the backup; an old ledger is not a fresh spending allowance.

The current design has one instance and no high availability. A machine/disk loss can interrupt the demo. Backups, restore observation and free judge access through the evaluation window remain release obligations.

After the evaluation obligation and under current authorization, stop services, archive required evidence, and remove the EC2 instance, unneeded volumes/snapshots, public address and DNS entry. Inventory all billed resources first. Ordinary `docker compose down` preserves named volumes; avoid `down -v` or volume deletion while the release still needs its records/certificates. No teardown action has been run.

## Sources checked for this preparation

- [Caddy Basic Auth](https://caddyserver.com/docs/caddyfile/directives/basic_auth): hashed-password entry gate.
- [Caddy reverse proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy): request headers and WebSockets.
- [CloudFront WebSockets](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-working-with.websockets.html) and [origin headers](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/add-origin-custom-headers.html): considered for a future AWS-issued URL. No CloudFront distribution/template is included here; do not claim that alternative has been configured.
