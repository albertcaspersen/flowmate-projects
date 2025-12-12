import { useCoreStore } from "~/stores/core";

export default defineNuxtPlugin(async () => {
    if (!process.server) {
        return;
    }

    const store = useCoreStore();
    store.setCacheKey();
    await store.fetchProjectInitData();
});
