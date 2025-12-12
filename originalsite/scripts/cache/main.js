import fs from "fs";

const url = 'http://localhost:3000/-/healthz'; // Replace with the URL you want to call
// const url = process.env.NUXT_PUBLIC_BACKEND_URL + '/wp-json/wp/v2/healthz'; // Replace with the URL you want to call


export async function callUrl(url) {
    try {
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();
            // console.log(`Request successful:`, data);
            // TODO - we could add the build number to the cache key here instead of adding it from runtimeConfig.
            if (data.hasOwnProperty('cache_key')) {
                let jsonData = JSON.stringify({
                    cache_key: data.cache_key,
                    timestamp: data.time
                });
                fs.writeFile('/app/cache.config.json', jsonData, err => {
                    if (err) {
                        console.error(err);
                    }
                    // done!
                });
            }

        } else {
            console.log(`Request failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

export function startCalling(url, interval) {
    setInterval(() => callUrl(url), interval);
}

startCalling(url, 30000);