# -------- Base Stage --------
FROM node:23-slim AS base

# RUN apk add --no-cache libc6-compat
WORKDIR /app

# -------- Dependencies Stage --------
FROM base AS deps
# RUN npm config set strict-ssl false
# RUN yarn config set strict-ssl false
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  else echo "No lockfile found." && exit 1; fi

# -------- Build Stage --------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ✅ Disable telemetry & ESLint in production build
# ENV NEXT_TELEMETRY_DISABLED=1
# ENV NEXT_DISABLE_ESLINT=true
# ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm run build; \
  else echo "No lockfile found." && exit 1; fi

# -------- Production Runner Stage --------
FROM node:23-slim AS runner

WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000

# Create non-root user
# RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R node:node /app

USER node
EXPOSE 5000

CMD ["node", "server.js"]
