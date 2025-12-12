export default defineSitemapEventHandler(async (e) => {
    const config = useRuntimeConfig();
    const adminUrl = config.private.backendUrl;
    const fetchUrl = adminUrl + '/wp-json/wp/v3/routes';
    const response = await fetch(fetchUrl);
    const routes = await response.json();

    return routes.map((p: any) => {
        return {
            loc: p.path,
            lastmod: p.modified,
        };
    });
});
