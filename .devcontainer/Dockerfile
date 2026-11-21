# Debian rather than Alpine because sass-embedded needs glibc. The base image
# already ships openssh-client for signing through the forwarded agent. The
# Hugo version comes from /.hugo-version, shared with CI; corepack is enabled
# here because postCreateCommand runs as `node`.
FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN --mount=type=bind,source=.hugo-version,target=/tmp/.hugo-version \
    version="$(cat /tmp/.hugo-version)" \
    && arch="$(dpkg --print-architecture)" \
    && curl -fsSL "https://github.com/gohugoio/hugo/releases/download/v${version}/hugo_extended_${version}_linux-${arch}.tar.gz" \
        | tar -xz -C /usr/local/bin hugo \
    && hugo version \
    && corepack enable
