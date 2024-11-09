FROM node:20.9.0-alpine AS deps

WORKDIR /app
RUN apk add --no-cache \
  libc6-compat \
  python3 \
  make \
  g++
COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn install --frozen-lockfile --production=false
RUN npx prisma generate


FROM node:20.9.0-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

COPY . .
RUN yarn build


FROM node:20.9.0-alpine AS runner

WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV PORT=3333
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
RUN npx prisma generate
EXPOSE 3333

CMD ["yarn", "start:prod"]