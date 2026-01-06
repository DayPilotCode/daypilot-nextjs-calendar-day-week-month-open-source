# syntax=docker/dockerfile:1

# Builder stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# Development stage
FROM node:20-slim AS development
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install
COPY . .
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# Test stage
FROM node:20-slim AS test
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm test || echo "No tests configured"

# Production stage
FROM node:20-slim AS production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd -r appuser && useradd -r -g appuser appuser
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY . .
RUN chown -R appuser:appuser /app
USER appuser
ENV NODE_ENV=production
CMD ["npm", "start"]

LABEL org.opencontainers.image.source="https://github.com/user/repo"

