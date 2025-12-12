<template>
  <button @click="coreStore.toggleShowMenu()" class="flex gap-1 flex-col w-7 h-4 relative z-[26]">
    <span class="h-0.5 w-full absolute top-0 left-[50%] translate-x-[-50%] block transition-all duration-300 ease-in-out bg-primary" 
          :class="[coreStore.showMenu ? '-rotate-45 top-[50%] !bg-primary' : '']"></span>
    <span class="h-0.5 w-full absolute bottom-[50%] translate-y-1/2 left-[50%] translate-x-[-50%] block transition-opacity duration-300 ease-in-out bg-primary" 
          :class="[coreStore.showMenu ? 'opacity-0 !bg-primary' : '']"></span>
    <span class="h-0.5 w-full absolute bottom-0 left-[50%] translate-x-[-50%] block transition-all duration-300 ease-in-out bg-primary" 
          :class="[coreStore.showMenu ? 'rotate-45 top-[50%] !bg-primary' : '']"></span>
  </button>
</template>

<script setup>
import { useCoreStore } from '~/stores/core';
const coreStore = useCoreStore();
</script>
