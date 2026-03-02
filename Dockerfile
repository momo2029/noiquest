FROM node:24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl

COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN cd backend && npm ci
RUN cd frontend && npm ci

COPY backend ./backend
COPY frontend ./frontend

RUN cd backend && npx prisma generate && npm run build
RUN cd frontend && npm run build

FROM node:24-alpine

RUN apk add --no-cache curl openssl

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/frontend/dist ./public

ENV TZ=Asia/Shanghai
ENV NODE_ENV=production

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
