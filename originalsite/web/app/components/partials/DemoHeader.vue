<template>
  <div class="demo-header w-full px-5 sm:px-15 py-5 flex items-center justify-end absolute z-50">

    <div :class="demoSettings.header_layout === 'logo_center' ? 'left-1/2 transform -translate-x-1/2' : 'left-0'" class="demo-logo absolute top-0 py-5 px-5 sm:px-15">
      <cm-picture class="hover:cursor-pointer" :classes="'max-w-[150px] max-h-[50px]'" v-if="props.demoSettings.logo" :image-object="props.demoSettings.logo"></cm-picture>
    </div>

    <div class="max-md:hidden demo-menu flex gap-10 items-center">
      <div v-if="props.demoSettings.dummy_menu.length > 0" v-for="dummyItem in props.demoSettings.dummy_menu">
        <div class="hover:cursor-pointer" :class="dummyItem.is_button ? 'btn btn-solid btn-small' : ''"
             :style="dummyItem.is_button ? { backgroundColor: props.demoSettings.menu_button_color, color: props.demoSettings.menu_text_color } : { color: props.demoSettings.menu_text_color }">
          {{dummyItem.label}}
        </div>
      </div>
    </div>

    <div class="md:hidden">
      <div class="flex gap-1 flex-col w-7 h-4 relative z-[26]">
        <span class="h-[1px] w-full absolute top-0 left-[50%] translate-x-[-50%] block duration-300" :style="{ backgroundColor: props.demoSettings.menu_text_color }"></span>
        <span class="h-[1px] w-full absolute bottom-[50%] translate-y-1/2 left-[50%] translate-x-[-50%] block" :style="{ backgroundColor: props.demoSettings.menu_text_color }"></span>
        <span class="h-[1px] w-full absolute bottom-0 left-[50%] translate-x-[-50%] block duration-300" :style="{ backgroundColor: props.demoSettings.menu_text_color }"></span>
      </div>
    </div>

  </div>
</template>

<script setup>
// import { useCoreStore } from '~/stores/core';
// const store = useCoreStore();

const props = defineProps({
  demoSettings: {
    type: Object,
    default: () => {}
  }
});

</script>