#### STAGE 1: Build ###
FROM node:20-alpine as build

ARG CM_NPM_TOKEN

# Set environment variables
ENV NUXT_PUBLIC_FLOWMATE_ENABLED=true

USER root

WORKDIR /app

COPY ./app /app

# This one works
# COPY ./app/nuxt.config.flowmate.js /app/nuxt.config.js

# COPY ./app/.env.flowmate /app/.env -- we'll try to use the same env file.
# COPY ./app/.env.flowmate /app/.env
COPY ./.env /app/.env

# Create npmrc os we can install the private packages.
RUN echo "//registry.npmjs.org/:_authToken=${CM_NPM_TOKEN}" > /app/.npmrc

RUN apk update && \
    apk upgrade && \
    apk add --no-cache npm git openssh

RUN npm set progress=false && npm install -s --no-progress && npm cache clean --force && npm run build && npm prune --production

RUN chown -R root:root /app

### STAGE 2: App setup ###
FROM node:20-alpine

# Set work dir.
WORKDIR /app

# Copy files
COPY --chown=root:root --from=build ./app /app
# COPY ./app/.env.flowmate /app/.env

# Create dir for nginx cache
RUN mkdir -p /data/nginx/cache_proxy
RUN mkdir -p /data/nginx/cache_web

# update and install dependency
RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash nano htop

# Copy nginx config.
# COPY ./config/nginx/nginx.conf /etc/nginx/nginx.conf
# COPY ./config/nginx/nginx-default.conf /etc/nginx/http.d/default.conf
# COPY ./config/nginx/nginx-proxy-reverse.conf /etc/nginx/http.d/proxy.conf
# COPY ./config/nginx-redirects.map /etc/nginx/nginx-redirects.map

# Copy supervisor config
# RUN mkdir -p /etc/supervisor.d/
# COPY config/supervisord.conf /etc/supervisor.d/supervisord.ini

# RUN rc-update add nginx default
# RUN nginx

# set app host for nuxt
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV NUXT_PUBLIC_FLOWMATE_ENABLED=true
# ENV NUXT_APP_BASE_URL="/flowmate/"

EXPOSE 80 8080 3000

# Start npm.
CMD ["node", ".output/server/index.mjs"]