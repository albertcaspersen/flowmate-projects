/**
 * @file flowmate.ts
 * Composable for Flowmate functionality.
 */
export const useFlowmate = () => {

    // const eStore = editableStore();

    /**
     * Check if Flowmate is enabled.
     */
    const isEnabled = () : boolean => {
        const route = useRoute();
        const config = useRuntimeConfig();
        
        // Handle different possible types of the config value
        const flowmateConfig = config.public.flowmateEnabled;
        const flowmateEnabled = typeof flowmateConfig === 'boolean' ? flowmateConfig : flowmateConfig === 'true';
        
        const hasFmcid = !!route.query.fmcid;
        const hasFmsid = !!route.query.fmsid;
        
        return flowmateEnabled && hasFmcid && hasFmsid;
    }

    return {
        isEnabled,
    }

}
