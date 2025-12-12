import fs from "fs";
import {eventHandler} from "h3";

export default eventHandler(async event => {

    const config = useRuntimeConfig();
    const healthEndpoint = config.private.backendUrl + '/wp-json/wp/v2/healthz';

    let msg = {"Status": "Not OK"};
    // const { result, pending, error, refresh } = await useFetch(healthEndpoint);

    await fetch(healthEndpoint)
        .then((response) => response.json())
        .then((data) => {
            msg = data;
            if (data.hasOwnProperty('cache_key')) {
                let jsonData = JSON.stringify({
                    cache_key: data.cache_key,
                    timestamp: data.time
                });
                fs.writeFile('./cache.config.json', jsonData, err => {
                    if (err) {
                        console.error(err);
                    }
                    // done!
                });
            }

        });

    return msg;
});
