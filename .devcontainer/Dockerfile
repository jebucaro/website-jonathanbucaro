FROM node:24-trixie-slim

# Minimal tooling the slim image drops but this project needs:
# - git: postCreateCommand, Husky hooks, 1Password commit signing
# - openssh-client + ca-certificates: SSH agent / git over SSH / TLS
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git openssh-client ca-certificates \
    && rm -rf /var/lib/apt/lists/*
