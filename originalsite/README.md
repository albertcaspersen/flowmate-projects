# Starter

This is a template for Checkmate's headless nuxt projects.

## Installation

``` bash
$ cd my-project/app                  
# install dependencies
$ npm install 
```

### Pipelines & App Platform setup

Ved første kørsel af pipelinen bliver der oprettet et docker image, som bliver pushet til vores Docker Registry.

Derefter kan der oprettes en App platform app fra Digital Ocean.

For at deploye via pipeline skal der tilføjes en deployment variable til projektet; **DO_APP_PLATFORM_ID** 

Platform ID'et kan findes fra slug'en på app siden i digital ocean. 

Fx. https://cloud.digitalocean.com/apps/affcf13e-b8d3-48d9-a087-34f89b54ebbe/overview - App ID'et er her affcf13e-b8d3-48d9-a087-34f89b54ebbe.

Hvis man har doctl installeret og er logget ind kan man finde ID'et ved at liste alle apps med `doctl apps list`

## Searchmate Integration

To use searchmate with the built-in DB integration, add the following ENV variables to the app in DigitalOcean:

```
NUXT_PRIVATE_DB_HOST=
NUXT_PRIVATE_DB_DATABASE=
NUXT_PRIVATE_DB_USER=
NUXT_PRIVATE_DB_PASSWORD=
NUXT_PRIVATE_DB_DOCUMENTS_TABLE=wp_searchmate_documents
```

Once added you should be able to test the connection by running navigation to /api/searchmate in the browser.

The plugin will also be needed to be installed for the backend. If searchmate isn't enabled the frontend will automatically default to using the regular API endpoints instead.


## Flowmate integration

TODO add documentation.

```npm install git+ssh://<username>@bitbucket.org/CheckmateDev/flowmate-editor.git ```


## Usage

### Development

``` bash
# serve with hot reloading at localhost:3000
$ npm run dev
```

Go to [http://localhost:3000](http://localhost:3000)

### Production

``` bash
# test build for production and launch the server
$ docker-compose up -d
```

## Plugins 

Ikke alle nedenstående er installeret, men kan være brugbare for nogle projekter.

Plugins: 

1.```npm i @fancyapps/ui ``` (https://www.npmjs.com/package/@fancyapps/ui)

## Docker builds

I .docker/ mappen findes der to forskellige buid filer. Den ene er til brug af **"static"** sites, som vi nok primært vil bruge. 

Den anden er hvis vi har brug for at bruge "server" som target i nuxt config.

Den Dockerfile der ligger i roden er en kopi af .docker/static/Dockerfile.

## ENV variables
Since ENV variables don't work for static builds, you should use the publicRuntimeConfig in _old_nuxt.config.js
```
publicRuntimeConfig: {
    googleTagManagerId: process.env.GOOGLE_TAG_MANAGER_ID || 'GTM-XXXXXX'
},
```
Furthermore, to make env or deploy variables available during the build process, you need to specifically specify them in the app/.env.example file (not including the values)

During the build process an .env file will be created, using the example file as a template and substituting the placeholders with the values defined in bitbucket.

This may seem like a convoluted way, but this is the way!

