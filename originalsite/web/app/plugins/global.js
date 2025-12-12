export default defineNuxtPlugin(nuxtApp => {

    function getInternalPath(link) {

        let path;
        if(link.hasOwnProperty('url')) {
            path = link.url;
        }
        const {isInternal, path: internalPath} = useUrlParser(path);

        return isInternal ? internalPath : '';
    }

    function isInternalLink(link) {
        let url = link;
        if (link && link.hasOwnProperty('url')) {
            url = link.url;
        }
        const {isInternal} = useUrlParser(url);
        return isInternal;
    }
    return {
        provide: {
            isInternalLink: (link) => isInternalLink(link),
            getInternalPath: (link) => getInternalPath(link)
        }
    }
})


