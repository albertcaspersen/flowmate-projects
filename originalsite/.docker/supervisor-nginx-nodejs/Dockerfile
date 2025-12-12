### STAGE 1: Build ###
FROM node:16-alpine as build

WORKDIR /usr/src/nuxt-app
COPY ./app /usr/src/nuxt-app
COPY ./.env /usr/src/nuxt-app/.env

#ARG BACKEND_URL
#ENV BACKEND_URL ${BACKEND_URL}
#ARG WP_BACKEND_ENDPOINT
#ENV WP_BACKEND_ENDPOINT ${WP_BACKEND_ENDPOINT}

RUN apk update && apk upgrade && apk add git

# Install app
RUN npm ci --include=dev && npm cache clean --force && npm run build

### STAGE 2: Nginx setup ###
#FROM node:16-alpine
FROM nginx:1-alpine

# Set work dir.
WORKDIR /app

# Copy files
COPY --from=build ./usr/src/nuxt-app /app

# Create dir for nginx cache
RUN mkdir -p /data/nginx/cache_proxy
RUN mkdir -p /data/nginx/cache_web

# update and install dependency
RUN apk update && \
    apk upgrade && \
    apk add bash nano htop nodejs=16.16.0-r0 npm supervisor

# Copy nginx config.
COPY ./config/nginx/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY ./config/nginx/nginx-proxy-reverse.conf /etc/nginx/conf.d/proxy.conf
COPY ./config/nginx-redirects.map /etc/nginx/nginx-redirects.map

# Copy supervisor config
RUN mkdir -p /etc/supervisor.d/
COPY config/supervisord.conf /etc/supervisor.d/supervisord.ini

# RUN rc-update add nginx default
# RUN nginx

# set app host
ENV HOST=0.0.0.0

EXPOSE 80 8080 3000

# Run the App
# CMD ["npm", "start"]
# CMD ["nginx", "-g", "daemon off;"]
CMD ["/usr/bin/supervisord"]