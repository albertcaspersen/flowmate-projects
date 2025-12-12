<template>
  <!-- Breadcrumb -->
  <nav class="inline-flex" v-if="breadcrumbs" aria-label="Breadcrumb">
    <ol class="inline">
      <li class="inline-flex gap-2 items-center m-0" v-for="(breadcrumb, index) in breadcrumbs">
        <span class="ml-2 text-sm" v-if="index > 0"> / </span>
        <nuxt-link v-if="index < (totalBreadcrumbs-1)" :to="breadcrumb.path" class="font-sans normal-case text-sm w-max"><span v-html="breadcrumb.title"></span></nuxt-link>
        <a v-else aria-label="current page" class="font-sans font-bold normal-case text-sm w-max cursor-default hover:no-underline" v-html="breadcrumb.title"></a>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import {computed} from "vue";
import {useMenuHandler} from "~/composables/menuHandler";
const {currentRoute} = useRouter();

const props = defineProps({
  menuContext: {
    type: Object,
    default: null,
    required: true
  }
});

const currentMenuItem = computed(() => {
  const currentPath = currentRoute.value.fullPath;
  return useMenuHandler().getMenuItemByPath(currentPath, props.menuContext);
});

const breadcrumbs = computed (() => {
  const menuContext = props.menuContext;
  let breadcrumbs = [];
  let current = currentMenuItem.value;
  let parentId = parseInt(current.menu_item_parent);

  if (current.length === 0) {
    return breadcrumbs;
  }

  breadcrumbs.push({
    ID: current.ID,
    title: current.title,
    post_status: current.post_status,
    url: current.url,
    path: useMenuHandler().getInternalPath(current.url),
    menu_item_parent: current.menu_item_parent
  });

  // Add parents.
  while (parentId > 0) {
    current = useMenuHandler().getMenuItemById(parseInt(current.menu_item_parent), menuContext);
    breadcrumbs.push({
      ID: current.ID,
      title: current.title,
      post_status: current.post_status,
      url: current.url,
      path: useMenuHandler().getInternalPath(current.url),
      menu_item_parent: current.menu_item_parent
    });
    parentId = parseInt(current.menu_item_parent);
  }

  return breadcrumbs.reverse();
});

const totalBreadcrumbs = computed(() => {
  return breadcrumbs.value.length;
});

</script>
