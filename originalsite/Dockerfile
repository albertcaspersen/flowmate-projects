### TODO Create a separate build for flowmate and run it on PORT 3001 ###

#### STAGE 1: Build ###
FROM node:22-alpine as build

ARG CM_NPM_TOKEN
ARG BITBUCKET_BUILD_NUMBER
ARG BITBUCKET_COMMIT

# Set environment variables
ENV FLOWMATE_ENABLED=false

# USER root

WORKDIR /app

COPY ./web /app
COPY ./.env /app/.env

# Create npmrc os we can install the private packages.
RUN echo "//registry.npmjs.org/:_authToken=${CM_NPM_TOKEN}" > /app/.npmrc

RUN apk update && \
    apk upgrade && \
    apk add --no-cache npm git openssh

RUN npm set progress=false && npm install -s --no-progress && npm cache clean --force && npm run build && npm prune --production

# RUN chown -R root:root /app

### STAGE 2: App setup ###
FROM node:22-alpine

ARG BITBUCKET_BUILD_NUMBER
ARG BITBUCKET_COMMIT

# Set work dir.
WORKDIR /app

# Copy files
# COPY --chown=root:root --from=build ./app /app
COPY --from=build ./app /app
# COPY ./app /app
COPY ./.env /app/.env

# Create dir for nginx cache
RUN mkdir -p /data/nginx/cache_proxy && mkdir -p /data/nginx/cache_web && mkdir -p /opt/checkmate

COPY ./scripts /opt/checkmate/scripts

# update and install dependency
RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash nano htop nginx supervisor

# Copy nginx config.
COPY ./config/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./config/nginx/nginx-default.conf /etc/nginx/http.d/default.conf
COPY ./config/nginx/nginx-proxy-reverse.conf /etc/nginx/http.d/proxy.conf
COPY ./config/nginx-redirects.map /etc/nginx/nginx-redirects.map

# Copy supervisor config
RUN mkdir -p /etc/supervisor.d/
COPY config/supervisord.conf /etc/supervisor.d/supervisord.ini

# RUN rc-update add nginx default
# RUN nginx

# Install PHP.
# apk add php82-fpm php82-opcache php82-pdo

# set app host for nuxt
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV BITBUCKET_BUILD_NUMBER="${BITBUCKET_BUILD_NUMBER}"
ENV BITBUCKET_COMMIT="${BITBUCKET_COMMIT}"

EXPOSE 80

# Start npm.
# CMD ["npm", "start"]

# Start as nginx (does not work)
# CMD ["nginx", "-g", "daemon off;"]

# RUN chown -R www-data:www-data /app
# RUN addgroup -S checkmate && adduser -S checkmate -G checkmate && addgroup checkmate nginx

#RUN chown -R checkmate:checkmate /app
RUN chown -R nginx:nginx /app && chown -R nginx:nginx /opt/checkmate/scripts/cache && chown -R nginx:nginx /data/nginx
# RUN chown -R application:application /opt/checkmate/scripts/cache

USER nginx

# Supervisor should work - but at a slight cost in resources/ram usage
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor.d/supervisord.ini"]