<template>
  <div v-if="content">

    <Breadcrumbs :menu-context="mainMenu" v-if="activateBreadbrumbs"></Breadcrumbs>

    <FlexSection
        v-for="(item, index) in content"
        class="relative"
        :layout="item.acf_fc_layout"
        :key="index"
        :data="item"
        :index="index"
    >
      <HeroBlock v-if="item.acf_fc_layout === 'block_hero'" :data="item" :index="index" />
      <ShowcaseHero v-if="item.acf_fc_layout === 'block_showcase_hero'" :data="item" :index="index" />
      <FeatureRepeater v-if="item.acf_fc_layout === 'block_feature_repeater'" :data="item" :index="index" />
      <DomainFucker v-if="item.acf_fc_layout === 'block_domain_checker'" :data="item" :index="index" />
      <ZoomySlider v-if="item.acf_fc_layout === 'block_zoomy_slider'" :data="item" :index="index" />
      <DemoSlider v-if="item.acf_fc_layout === 'block_demo_slider'" :data="item" :index="index" />
      <!-- <tailwind-animation animationClass="animate-fade-up animate-once animate-duration-700 animate-delay-100 animate-ease-in-out"> -->
        <TextBlock v-if="item.acf_fc_layout === 'block_text'" :data="item" :index="index" />
        <ImageBlock v-if="item.acf_fc_layout === 'block_image'" :data="item" :index="index" />
        <VideoBlock v-if="item.acf_fc_layout === 'block_video'" :data="item" :index="index" />
        <AccordionBlock v-if="item.acf_fc_layout === 'block_accordion'" :data="item" :index="index" ></AccordionBlock>
        <QuoteBlock v-if="item.acf_fc_layout === 'block_quote'" :data="item" :index="index" ></QuoteBlock>
        <SideBySideBlock v-if="item.acf_fc_layout === 'block_side_by_side'" :data="item" :index="index" />
        <GalleryBlock v-if="item.acf_fc_layout === 'block_gallery'" :data="item" :index="index" />
        <FormBlock v-if="item.acf_fc_layout === 'block_form'" :data="item" :index="index" />
        <ArchiveBlock v-if="item.acf_fc_layout === 'block_archive'" :data="item" :index="index" />

      <!-- </tailwind-animation> -->
    </FlexSection>
  </div>
</template>

<script setup>
import { useCoreStore } from '~/stores/core';

const coreStore = useCoreStore();
const mainMenu = computed(() => coreStore.getMenu('menu-1'));
const activateBreadbrumbs = ref(false);

const props = defineProps({
  page: {
    type: Object,
    default: () => ({}),
  },
  content: {
    type: Array,
    default: () => [],
  },
  thumbnail: {
    type: Object,
    default: () => ({}),
  },
});
</script>


