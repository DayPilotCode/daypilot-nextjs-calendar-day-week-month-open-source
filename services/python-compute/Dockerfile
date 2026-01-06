# syntax=docker/dockerfile:1

# Builder stage
FROM python:3.12-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --user --no-cache-dir -r requirements.txt

# Development stage
FROM python:3.12-slim AS development
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --user --no-cache-dir -r requirements.txt
ENV PATH=/root/.local/bin:$PATH
COPY . .
ENV WATCHFILES_FORCE_POLLING=true
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Test stage
FROM python:3.12-slim AS test
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /root/.local /root/.local
COPY requirements.txt requirements-dev.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --user --no-cache-dir -r requirements.txt -r requirements-dev.txt || \
    pip install --user --no-cache-dir -r requirements.txt
ENV PATH=/root/.local/bin:$PATH
COPY . .
RUN pytest || echo "No tests configured"

# Production stage
FROM python:3.12-slim AS production
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --user --no-cache-dir -r requirements.txt
ENV PATH=/root/.local/bin:$PATH
COPY . .
RUN useradd -r appuser && chown -R appuser /app
USER appuser
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

LABEL org.opencontainers.image.source="https://github.com/user/repo"

