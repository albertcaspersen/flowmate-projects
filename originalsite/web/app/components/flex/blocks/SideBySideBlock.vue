<template>
  <div class="section-container py-8 md:py-16" :class="[containerClasses]">
    <div class="default-grid">
      <div class="col-span-full">
        <div class="max-w-[75%]">
          <HeadlineFields :data="data" :index="index"></HeadlineFields>
        </div>
      </div>
      <div v-if="data.components" v-for="(component, index) in data.components" :key="index" class="col-span-12" :class="getColumnClass(index)">
        <TextBlock v-if="component.block_type === 'text'" :is-in-sbs="true" :data="component.block_text" :index="index" />
        <ImageBlock v-if="component.block_type === 'image'" :is-in-sbs="true" :data="component.block_image" :index="index" />
        <VideoBlock v-if="component.block_type === 'video'" :is-in-sbs="true" :data="component.block_video" :index="index" />
        <QuoteBlock v-if="component.block_type === 'quote'" :is-in-sbs="true" :data="component.block_quote" :index="index" />
        <AccordionBlock v-if="component.block_type === 'accordion'" :is-in-sbs="true" :data="component.block_accordion" :index="index" />
        <FormBlock v-if="component.block_type === 'form'" :is-in-sbs="true" :data="component.block_form" :index="index" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {useCheckmateFlexSettings} from "~/composables/checkmateFlexSettings";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: null,
  },
});

const getColumnClass = (i) => {
  const classes = [];
  const isRtl = props.data.settings.component_direction === 'rtl';
  const isAlone = props.data.components.length === 1;
  if(isRtl) {
    if (i === 0) {
      classes.push('sm:order-2');
    } else {
      classes.push('sm:order-1');
    }
  }

  if(props.data.settings.layout === '70_30') {
    if (i === 0) {
      classes.push('sm:col-span-8');
      if(isRtl && isAlone) {
        classes.push('sm:col-start-5');
      }
    } else {
      classes.push('sm:col-span-4');
    }
  } else if(props.data.settings.layout === '30_70') {
    if (i === 0) {
      classes.push('sm:col-span-4');
      if(isRtl && isAlone) {
        classes.push('sm:col-start-9');
      }
    } else {
      classes.push('sm:col-span-8');
    }
  } else {
    classes.push('sm:col-span-6');
    if(isRtl && isAlone) {
      classes.push('sm:col-start-7');
    }
  }
  return classes.join(' ');
}

/**
 * Container classes
 * @type {ComputedRef<*[]>}
 */
const containerClasses  = computed (() => {
  let classes = [];
  if (props.data.settings) {
    const { getContainerClasses } = useCheckmateFlexSettings(props.data.settings);
    classes = getContainerClasses( 'margin', 'padding', 'width');
  }
  return classes;
});


</script>
