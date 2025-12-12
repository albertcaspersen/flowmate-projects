<template>
  <div>
    <!-- Click Button -->
    <span class="btn cursor-pointer" :class="buttonClasses" v-if="props.isClickButton">
      <span class="btn-text"><slot></slot></span>
      <div class="btn-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
    </span>
    
    <!-- Internal Link -->
    <NuxtLink class="btn" :class="buttonClasses" :to="buttonPath" v-else-if="props.button && isInternal" :target="props.button && props.button.link ? props.button.link.target : ''">
      <span class="btn-text">{{buttonText}}</span>
      <div class="btn-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
    </NuxtLink>
    
    <!-- External Links -->
    <a class="btn" :class="buttonClasses" :target="props.button.link?.target" v-else-if="props.button && props.button.link && !isInternal" :href="buttonPath">
      <span class="btn-text">{{buttonText}}</span>
      <div class="btn-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
    </a>
  </div>
</template>

<script setup>
const props = defineProps({
  button: {
    type: Object,
    default: function() {
      return {}
    }
  },
  icon: {
    type: Boolean,
    default: true
  },
  isClickButton: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'primary'
  },
  type: {
    type: String,
    default: 'solid'
  }
});

const buttonClasses = computed(() => {
  const classes = [];
  
  // Add variant class if provided, else use default
  if(props.button.variant) {
    classes.push(`btn-${props.button.variant}`);
  } else {
    classes.push(`btn-${props.variant}`);
  }
  
  // Add type class if provided, else use default
  if(props.button.type) {
    classes.push(`btn-${props.button.type}`);
  } else {
    classes.push(`btn-${props.type}`);
  }
  
  return classes.join(' ');
})

const urlToUse = computed(() => {
  if(props.button.internal_link?.url) {
    return props.button.internal_link.url;
  } else if(props.button.link?.url) {
    return props.button.link.url;
  } else {
    return "";
  }
})

const buttonText = computed(() => {
  if(props.button.internal_link?.url && props.button.internal_link.button_text) {
    return props.button.internal_link.button_text;
  } else if(!props.button.internal_link?.url && props.button.link?.title) {
    return props.button.link.title;
  } else {
    return "";
  }
})

const buttonPath = computed(() => {
  const {path} = useUrlParser(urlToUse.value);
  return path;
})

const isInternal = computed(() => {
  const {isInternal} = useUrlParser(urlToUse.value);
  return isInternal;
})
</script>
