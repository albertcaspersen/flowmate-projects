<script setup>
import {useCoreStore} from "~/stores/core";
const store = useCoreStore();

const route = useRouter();
const currentPath = computed(() => {
  return route.currentRoute.value.path;
});



watch(currentPath, (newVal, oldVal) => {
  if(newVal !== oldVal) {
    store.routeUpdated();
  }
});
</script>
<template>
  <div id="mainLayout">

    <div id="slot">
      <slot></slot>
    </div>

  </div>
</template>
