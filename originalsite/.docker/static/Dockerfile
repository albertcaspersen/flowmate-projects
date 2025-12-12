### STAGE 1: Build ###
FROM node:16.14.2-alpine as build
#RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY ./app /usr/src/nuxt-app
RUN apk update && apk upgrade
RUN apk add git

RUN npm set progress=false && \
    npm install -s --no-progress && \
    npm run generate && \
    npm prune --production

### STAGE 2: Nginx setup ###

#FROM node:12.21.0-alpine
FROM nginx:1.21.6-alpine

# Copy files
COPY --from=build ./usr/src/nuxt-app/dist /usr/share/nginx/html

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git bash
#RUN apk add python3 make g++

# Static build files.
# COPY ./dist /usr/share/nginx/html
COPY ./config/default.conf /etc/nginx/conf.d/default.conf

# expose 5000 on container
EXPOSE 5000
EXPOSE 80

# set app serving to permissive / assigned
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=5000

# Start the nginx app.
CMD ["nginx", "-g", "daemon off;"]
