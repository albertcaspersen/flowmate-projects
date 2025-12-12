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

FROM node:16-alpine

# Set work dir.
WORKDIR /app

# Copy files
COPY --from=build ./usr/src/nuxt-app /app

# update and install dependency
RUN apk update && \
    apk upgrade && \
    apk add bash nano

# set app host
ENV HOST=0.0.0.0

EXPOSE 80 3000

# Run the App
CMD ["npm", "start"]
