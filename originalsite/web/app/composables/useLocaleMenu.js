import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCoreStore } from '~/stores/core';

export const useLocaleMenu = () => {
  const { locale } = useI18n();
  const store = useCoreStore();
  
  const getLocaleMenu = (baseMenuKey) => {
    if (store.getLocaleMenu) {
      return store.getLocaleMenu(baseMenuKey, locale.value);
    }
    
    const localeSpecificKey = `${baseMenuKey}_${locale.value}`;
    const localeMenu = store.getMenu ? store.getMenu(localeSpecificKey) : undefined;
    
    if (localeMenu && Array.isArray(localeMenu) && localeMenu.length > 0) {
      return localeMenu;
    }
    
    return store.getMenu ? store.getMenu(baseMenuKey) : [];
  };
  
  const useLocaleMenuComputed = (baseMenuKey) => {
    return computed(() => getLocaleMenu(baseMenuKey));
  };
  
  return {
    getLocaleMenu,
    useLocaleMenuComputed,
  };
}; 