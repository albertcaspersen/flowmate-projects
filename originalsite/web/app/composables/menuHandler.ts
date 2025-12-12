import {useUrlParser} from "~/composables/urlParser";

export const useMenuHandler = () => {

    const submenu = ref([]);
    const parentMenu = ref([]);

    const getInternalPath = (url: string) => {
        // Check if the url is internal and return the path.
        const {url: internalUrl, path, isInternal} = useUrlParser(url);
        if (isInternal) {
            return path;
        } else {
            return false;
        }
    }

    const getMenuItemByPath = (currentPath: string, menu: Array<[]>) => {
        // Find the current menu item in the array, recursively loop through children[] if it isnt empty and return the first match.

        // Check for trailing slash and add if missing.
        if (currentPath.slice(-1) !== '/') {
            currentPath = currentPath + '/';
        }

        // Start a recursive loop to look for the submenu item.
        menu.forEach((item: any) => {

            if (!item || item.url === undefined) {
                // console.log("ITEM", item.url, item, currentPath);
                return;
            }

            const {url, path, isInternal} = useUrlParser(item.url);
            if (!isInternal) {
                // console.log("external link");
                // return false;
            }
            if (path === currentPath) {
                submenu.value = item;
                return item;
                // return item.children;
            } else {
                if (item.hasOwnProperty('children') && item.children.length > 0) {
                    const result = getMenuItemByPath(currentPath, item.children);
                    if (result.length > 0) {
                        submenu.value = result;
                        return result;
                    }

                }
            }
        });

        return submenu.value;

    }

    const getMenuItemById = (id: number, menu: Array<[]>) => {
        // Find the current menu item in the array, recursively loop through children[] if it isnt empty and return the first match.
        // Start a recursive loop to look for the submenu item.

        menu.forEach((item: any) => {
            // console.log("ITEM", item.ID, id);
            if (item.ID === id) {
                parentMenu.value = item;
                return item;
                // return item.children;
            } else {
                if (item.hasOwnProperty('children') && item.children.length > 0) {
                    const result = getMenuItemById(id, item.children);
                    if (result.length > 0) {
                        parentMenu.value = result;
                        return result;
                    }

                }
            }
        });

        return parentMenu.value;

    }

    return {
        getMenuItemByPath,
        getMenuItemById,
        getInternalPath
    }

}