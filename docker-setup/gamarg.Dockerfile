ARG FRAPPE_PATH=https://github.com/frappe/frappe
ARG FRAPPE_BRANCH=version-16

FROM python:3.14-slim-bookworm AS base

# Install dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
    curl \
    git \
    pkg-config \
    build-essential \
    default-libmysqlclient-dev \
    libpq-dev \
	ca-certificates \
    gnupg \
	cron \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn

# Create user
RUN useradd -ms /bin/bash frappe

FROM base AS builder
# Setup bench and install your app
USER frappe
WORKDIR /home/frappe
RUN pip install --user frappe-bench

# Initialize bench and get your custom app
RUN export PATH="${PATH}:/home/frappe/.local/bin" && \
    bench init --skip-redis-config-generation --no-procfile frappe-bench --frappe-branch version-16 && \
    cd frappe-bench && \
    bench get-app https://github.com/nihancj/gamarg.git

FROM python:3.14-slim-bookworm AS runner

USER root
RUN apt-get update && apt-get install -y \
    mariadb-client git \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash frappe
USER frappe
WORKDIR /home/frappe/frappe-bench


# Copy the prepared bench from builder
COPY --from=builder --chown=frappe:frappe /home/frappe/frappe-bench .

COPY --from=builder --chown=frappe:frappe /home/frappe/.local /home/frappe/.local

ENV PATH="/home/frappe/.local/bin:/home/frappe/frappe-bench/env/bin:${PATH}"

EXPOSE 8000 9000
