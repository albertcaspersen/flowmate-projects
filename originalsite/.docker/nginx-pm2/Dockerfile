### STAGE 1: Nginx setup ###
# @deprecated - Don't use this
FROM node:16-alpine

# Copy files
# COPY --from=build ./usr/src/nuxt-app /app
COPY ./app /app
COPY ./.env /app/.env

WORKDIR /app

# update and install dependencies
RUN apk update && apk upgrade && apk  add git bash
#RUN apk add python3 make g++

RUN npm install pm2 -g

# Install app
RUN npm ci --include=dev && npm cache clean --force && npm run build

# Static build files.
# COPY ./dist /usr/share/nginx/html
# Nginx config
# COPY ./config/nginx/nginx-default.conf /etc/nginx/conf.d/default.conf

# expose 5000 on container
EXPOSE 5000 3000 80

# set app serving to permissive / assigned
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=5000

# RUN pm2 start ecosystem.config.js

# Start the nginx app.
# Fork mode:
# CMD [ "pm2-runtime", "start", "npm", "--", "start" ]
# Cluster mode:
CMD [ "pm2-runtime", "--raw", "start", "ecosystem.config.js" ]

# CMD ["nginx", "-g", "daemon off;"]