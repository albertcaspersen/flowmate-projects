<template>
  <div class="mb-4" ref="accordionItem">
    <button class="flex justify-between items-center w-full text-left bg-[#010101] text-white rounded-lg border border-white/20 px-6 py-4" @click="toggleAccordion">
      <span class="h6 !mb-0" v-html="item.accordion_header"></span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="duration-300 transition-transform" :class="isActive ? 'rotate-180' : ''">
        <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div ref="contentRef" :style="'max-height:'+maxHeight+';'" class="overflow-hidden duration-500">
      <div class="pt-6 px-6">
        <div v-html="item.accordion_text"></div>
        <Buttons :data="item"></Buttons>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: null,
  },
  activeIndexes: {
    type: Array,
    default: () => [],
  },
  activeHover: {
    type: Number,
    default: null,
  },
  toggleActiveIndex: {
    type: Function,
    default: () => {},
  },
});

const isActive = computed(() => props.activeIndexes.includes(props.index));
const toggleAccordion = () => {
  props.toggleActiveIndex(props.index);
};

const accordionItem = ref();
const showContent = ref(false);
const maxHeight = ref('0px');
const contentRef = ref(null);
const scroll = ref(true);
watch(() => isActive.value, (newVal, oldVal) => {
  if (contentRef.value && isActive.value) {
    maxHeight.value = contentRef.value.scrollHeight + 'px';

    setTimeout(() => {
      if(scroll.value) {
        const {top} = accordionItem.value.getBoundingClientRect();
        let scrollTop = window.scrollY + top - 90;
        if (top < 0) {
          if (window.innerWidth > 960) {
            scrollTop = window.scrollY + top - 115;
          }
          window.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
          });
        }
      }
    }, 500);

    setTimeout(() => {
      showContent.value = true;
    }, 300);
  } else {
    showContent.value = false;
    maxHeight.value = '0px';
  }
});

onMounted(() => {
  if(props.index === 0) {
    scroll.value = false;
    toggleAccordion();
    setTimeout(() => {
      scroll.value = true;
    }, 600);
  }
});

</script>
