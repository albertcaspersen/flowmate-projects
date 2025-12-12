import mysql from 'mysql2';
import {getQuery} from "h3";
import {useCacheKey} from "~~/server/composables/cacheKey";
// create the connection to database

export default cachedEventHandler(
    async (e) => {

        const config = useRuntimeConfig();

        // if (!config.private.db || !config.private.db.host || !config.private.db.port || !config.private.db.user || !config.private.db.password || !config.private.db.database || !config.private.db.documentsTable) {
        //     // No database config found.
        //     return false;
        // }

        const connection = mysql.createConnection({
            host: config.private.db.host,
            port: config.private.db.port,
            user: config.private.db.user,
            password: config.private.db.password,
            database: config.private.db.database
        });

        // Verify that the database is connected successfully
        connection.connect((error) => {
            if(error){
                // Database connection failed.
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Connection to the database failed.',
                    fatal: false
                });
            }
            //  console.log('The database is successfully connected.');
        })

        // Get the current request params.
        const query = getQuery(e);
        let path = query.path;

        // Make sure the path is prefixed and suffixed with /
        if (path) {
            if (!path.startsWith('/')) {
                path = '/' + path;
            }
            if (!path.endsWith('/')) {
                path = path + '/';
            }
        }

        let post_id = query.id;
        let post_ids = query.ids;

        try {

            let results;

            if (post_id) {

                results = await connection.promise().query(
                    'SELECT * FROM `'+config.private.db.documentsTable+'` WHERE `post_id` = ? LIMIT 1', [
                        post_id
                    ]
                );

            } else if (path) {

                results = await connection.promise().query(
                    'SELECT * FROM `'+config.private.db.documentsTable+'` WHERE `path` = ? LIMIT 1', [
                        path
                    ]
                );

            } else if (post_ids) {

                post_ids = post_ids.split(',');

                results = await connection.promise().query(
                    'SELECT * FROM `'+config.private.db.documentsTable+'` WHERE `post_id` IN (?)', [
                        post_ids
                    ]
                );

            }

            // Check if the path exists in the database.
            if (!results || !results[0].length) {
                // No document found.

                // throw createError({
                //     statusCode: 400,
                //     statusMessage: 'Page Not Found'
                // })

                // Close the connection
                connection.end((err) => {
                    if (err) {
                        console.error('Error closing the connection:', err);
                        return;
                    }
                });


                return [];
            }

            const output = [];

            results[0].forEach(result => {

                if (query.hasOwnProperty('_fields')) {
                    // Filter the results based on the fields.
                    const fields = query._fields.split(',');
                    Object.keys(result.document).forEach(key => {
                        if (!fields.includes(key)) {
                            delete result.document[key];
                        }
                    });
                }

                output.push(result.document);
            })

            connection.end((err) => {
                if (err) {
                    console.error('Error closing the connection:', err);
                    return;
                }
            });


            return output;

        } catch (error) {

            connection.end((err) => {
                if (err) {
                    console.error('Error closing the connection:', err);
                    return;
                }
            });

            throw createError({
                statusCode: error.statusCode,
                statusMessage: error.statusMessage,
                fatal: false
            });
        }

    },
    {
        name: 'cachemate-db',
        maxAge: 5, // cache URLs for 15 second
        swr: true,
        getKey: (e: H3Event) => {
            const query = getQuery(e);
            const { generateApiCacheKey } = useCacheKey();
            return generateApiCacheKey('content', query, ['path', 'id', 'ids', '_fields', 'lang']);
        },
        // shouldBypassCache: (e) => {
        //     // Bypass is the env is localhost
        //     return process.env.NODE_ENV === 'development';
        // }
    }
)