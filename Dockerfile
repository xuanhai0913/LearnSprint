# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:26.6.0-bookworm-slim
FROM ${NODE_IMAGE} AS dependencies
WORKDIR /app
ENV CI=true
RUN npm install --global pnpm@10.33.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM dependencies AS build
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY apps/web ./apps/web
COPY packages/contracts ./packages/contracts
RUN pnpm build

FROM dependencies AS production-dependencies
RUN pnpm install --prod --frozen-lockfile --ignore-scripts --offline

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production LEARNSPRINT_DATA_DIR=/data
WORKDIR /app
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=production-dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=production-dependencies /app/apps/api/package.json ./apps/api/package.json
COPY --from=production-dependencies /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY content ./content
COPY deploy/healthcheck.mjs ./deploy/healthcheck.mjs
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD ["node", "deploy/healthcheck.mjs"]
CMD ["node", "apps/api/dist/main.js"]
