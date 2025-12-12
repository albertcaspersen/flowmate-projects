export default defineEventHandler((event) => {
    if(event.req.url === '/robots.txt') {
        const config = useRuntimeConfig();
        const sitemapUrl = config.public.siteUrl + '/sitemap.xml';
        event.res.setHeader('Content-Type', 'text/plain')
        event.res.end('User-agent: *\nDisallow:\n\nSitemap: ' + sitemapUrl)
    }
})
