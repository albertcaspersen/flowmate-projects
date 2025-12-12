<template>
  <div 
    class="section-container py-8 md:py-16" 
    :class="containerClasses"
    ref="sectionRef"
  >
    <div class="default-grid">
      <!-- Text column on the left -->
      <div 
        class="col-span-full md:col-span-6" 
        ref="textColRef"
      >
        <div ref="headlineRef">
          <HeadlineFields :data="data" :index="index"></HeadlineFields>
        </div>
        <div 
          v-if="data.text_col_one" 
          ref="textRef"
          class="mt-4" 
          v-html="data.text_col_one"
        ></div>
        <div ref="buttonsRef">
          <Buttons :data="data"></Buttons>
        </div>
      </div>
      
      <!-- Domain search column on the right -->
      <div 
        class="col-span-full md:col-span-6 mt-8 md:mt-0" 
        ref="domainSearchRef"
      >
        <div class="p-6 rounded-lg">
          <h3 class="text-xl font-semibold mb-4 text-current">Check Domain Availability</h3>
          
          <!-- Domain search form -->
          <div v-if="!showLeadForm" class="">
            <div class="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                v-model="domainName" 
                placeholder="Enter domain name" 
                class="flex-grow px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                @keyup.enter="checkDomainAvailability"
                ref="inputRef"
              />
              <button 
                @click="checkDomainAvailability" 
                class="btn btn-solid"
              >
                <span class="btn-text">Search</span>
                <div class="btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
              </button>
            </div>
            
            <div class="text-sm text-current opacity-50">
              <p class="mt-2">Only .dk domains are currently supported.</p>
            </div>
            
            <!-- Results section -->
            <div v-if="isSearching" class="mt-6 flex justify-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            </div>
            
            <div v-if="!isSearching && searchResults.length > 0" class="mt-6" ref="resultsRef">
              <div v-for="(result, idx) in searchResults" :key="idx" 
                class="border rounded-lg p-4 mb-4 flex items-center justify-between"
                :class="result.available ? 'border-primary-green' : 'border-red-500'"
              >
                <span class="text-xl font-bold text-current">{{ result.domain }}</span>
                
                <div class="flex items-center">
                  <div v-if="result.available" class="flex items-center">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-primary-green mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <span class="text-current font-medium">Domain Available!</span>
                    <button 
                      @click="showLeadFormForDomain(result)" 
                      class="ml-4 px-3 py-1 text-sm bg-primary-green rounded text-black transition-colors hover:bg-primary-green/80"
                    >
                      I'm interested
                    </button>
                  </div>
                  
                  <div v-else class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <span class="text-red-600 font-medium">Not Available</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="errorMessage" class="mt-4 p-3 border border-red-500 text-red-700 rounded-lg text-center">
              {{ errorMessage }}
            </div>
          </div>
          
          <!-- Lead capture form -->
          <div v-if="showLeadForm" class="space-y-6">
            <div class="flex justify-between items-center">
              <h4 class="font-medium text-current">Interested in domain: <strong>{{ selectedDomain.domain }}</strong></h4>
              <button @click="showLeadForm = false" class="text-current hover:text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="submitLeadForm" class="space-y-5">
              <div>
                <label for="lead-name" class="block text-sm font-medium text-current mb-1">Your Name *</label>
                <input 
                  id="lead-name"
                  v-model="leadInfo.name" 
                  type="text" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black" 
                  required
                />
              </div>
              
              <div>
                <label for="lead-email" class="block text-sm font-medium text-current mb-1">Your Email *</label>
                <input 
                  id="lead-email"
                  v-model="leadInfo.email" 
                  type="email" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black" 
                  required
                />
              </div>
              
              <div>
                <label for="lead-phone" class="block text-sm font-medium text-current mb-1">Your Phone</label>
                <input 
                  id="lead-phone"
                  v-model="leadInfo.phone" 
                  type="tel" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-current mb-1">What are you interested in?</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input 
                      type="radio" 
                      name="interest-type" 
                      value="acquisition" 
                      v-model="leadInterestType"
                      class="mr-2" 
                      required
                    />
                    <span class="text-current">Register this domain</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      type="radio" 
                      name="interest-type" 
                      value="alternatives" 
                      v-model="leadInterestType"
                      class="mr-2"
                    />
                    <span class="text-current">Finding similar domains</span>
                  </label>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="privacy-policy" 
                  v-model="leadInfo.acceptedPrivacyPolicy"
                  required
                  class="form-checkbox"
                />
                <label for="privacy-policy" class="text-sm text-current">I accept the <a href="/privacy-policy/" target="_blank" class="text-sm text-current underline hover:no-underline">privacy policy.</a></label>
              </div>
              
              <div>
                <button 
                  type="submit" 
                  class="btn btn-solid"
                  :disabled="isSubmittingLead"
                >
                  <span v-if="isSubmittingLead" class="btn-text flex items-center justify-center gap-2">
                    <span class="inline-block w-4 h-4 border-2 border-solid border-current border-r-transparent rounded-full animate-spin"></span>
                    Submitting...
                  </span>
                  <span v-else class="btn-text">Submit Interest</span>
                  <div class="btn-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                </button>
              </div>
              
              <div v-if="leadErrorMessage" class="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {{ leadErrorMessage }}
              </div>
            </form>
          </div>
          
          <!-- Lead submission success message -->
          <div v-if="leadSubmissionSuccess" class="space-y-6">
            <div class="text-center p-6 rounded-lg border border-primary-green ">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-primary-green mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 class="text-xl font-medium text-white">Thank You!</h4>
              <p class="mt-2 text-white">Your interest in {{ selectedDomain.domain }} has been submitted. We'll be in touch soon!</p>
              <div class="mt-6 flex justify-center">
                <button 
                  @click="resetForm" 
                  class="btn btn-solid"
                >
                  <span class="btn-text">Search Another Domain</span>
                  <div class="btn-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useCheckmateFlexSettings } from "~/composables/checkmateFlexSettings";
import { useGsapAnimations } from "~/composables/useGsapAnimations";

// Props
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: null,
  }
});

// Domain search state
const domainName = ref("");
const tlds = ref({
  dk: true
});
const isSearching = ref(false);
const searchResults = ref([]);
const errorMessage = ref("");

// Lead capture state
const showLeadForm = ref(false);
const selectedDomain = ref(null);
const leadInfo = ref({
  name: "",
  email: "",
  phone: "",
  acceptedPrivacyPolicy: false
});
const leadInterestType = ref("acquisition");
const isSubmittingLead = ref(false);
const leadErrorMessage = ref("");
const leadSubmissionSuccess = ref(false);

// Animation refs
const sectionRef = ref(null);
const textColRef = ref(null);
const headlineRef = ref(null);
const textRef = ref(null);
const buttonsRef = ref(null);
const domainSearchRef = ref(null);
const inputRef = ref(null);
const resultsRef = ref(null);

// Store instances for cleanup
const scrollTriggerInstances = ref([]);
const splitTextInstances = ref([]);
const styleElements = ref([]);

/**
 * Container classes
 * @type {ComputedRef<*[]>}
 */
const containerClasses = computed(() => {
  let classes = [];
  if (props.data.settings) {
    const { getContainerClasses } = useCheckmateFlexSettings(props.data.settings);
    classes = getContainerClasses('background', 'margin', 'padding', 'width', 'text');
  }
  return classes;
});

/**
 * Show lead form for a specific domain
 */
const showLeadFormForDomain = (domain) => {
  selectedDomain.value = domain;
  showLeadForm.value = true;
};

/**
 * Reset the form and all states
 */
const resetForm = () => {
  domainName.value = "";
  searchResults.value = [];
  errorMessage.value = "";
  showLeadForm.value = false;
  selectedDomain.value = null;
  leadInfo.value = {
    name: "",
    email: "",
    phone: "",
    acceptedPrivacyPolicy: false
  };
  leadInterestType.value = "acquisition";
  leadErrorMessage.value = "";
  leadSubmissionSuccess.value = false;
};

/**
 * Validate and clean the domain name
 */
const validateDomain = (domain) => {
  if (!domain) return { valid: false, message: "Please enter a domain name" };
  
  // Remove spaces and convert to lowercase
  domain = domain.trim().toLowerCase();
  
  // Basic domain name validation
  if (domain.includes(' ')) {
    return { valid: false, message: "Domain name cannot contain spaces" };
  }
  
  if (/[^a-z0-9-.]/g.test(domain)) {
    return { valid: false, message: "Domain can only contain letters, numbers, and hyphens" };
  }
  
  // If domain doesn't end with .dk, add it
  if (!domain.endsWith('.dk')) {
    domain = `${domain}.dk`;
  }
  
  return { valid: true, domain };
};

/**
 * Check domain availability
 * This function will call the API to check domain availability
 */
const checkDomainAvailability = async () => {
  // Validate the domain
  const validation = validateDomain(domainName.value);
  if (!validation.valid) {
    errorMessage.value = validation.message;
    return;
  }
  
  // Reset states
  errorMessage.value = "";
  isSearching.value = true;
  searchResults.value = [];
  
  try {
    const domainToCheck = validation.domain;
    
    // Call the domain check API endpoint with trailing slash
    const response = await $fetch(`/api/domain-check/?domain=${domainToCheck}`);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    searchResults.value = [{
      domain: domainToCheck,
      tld: 'dk',
      available: response.available,
      checked_at: response.checked_at
    }];
    
    // Track domain search event
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'domainSearch',
        searchTerms: domainToCheck,
        results: searchResults.value.map(r => ({ domain: r.domain, available: r.available }))
      });
    }
  } catch (error) {
    console.error("Domain search error:", error);
    errorMessage.value = "An error occurred while checking domain availability. Please try again.";
  } finally {
    isSearching.value = false;
  }
};

/**
 * Submit the lead form to express interest in a domain
 */
const submitLeadForm = async () => {
  if (!leadInfo.value.name || !leadInfo.value.email || !leadInfo.value.acceptedPrivacyPolicy) {
    leadErrorMessage.value = "Please fill out all required fields";
    return;
  }
  
  isSubmittingLead.value = true;
  leadErrorMessage.value = "";
  
  try {
    // Format the request body properly to match API expectations
    const formData = {
      name: leadInfo.value.name,
      email: leadInfo.value.email,
      phone: leadInfo.value.phone || "",
      domain: selectedDomain.value.domain,
      interestType: leadInterestType.value,
      timestamp: new Date().toISOString()
    };
    
    // Make sure we're using a trailing slash for the endpoint
    const response = await $fetch('/api/submit-domain-lead/', {
      method: 'POST',
      body: JSON.stringify(formData), // Explicitly stringify to ensure proper format
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    // Show success message
    leadSubmissionSuccess.value = true;
    showLeadForm.value = false;
    
    // Track lead submission event
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'domainLeadSubmission',
        domain: selectedDomain.value.domain,
        interestType: leadInterestType.value
      });
    }
  } catch (error) {
    console.error("Lead submission error:", error);
    leadErrorMessage.value = "An error occurred while submitting your information. Please try again.";
  } finally {
    isSubmittingLead.value = false;
  }
};

// Animation setup
onMounted(() => {
  if (!sectionRef.value) return;
  
  const { $gsap, $gsapScrollTrigger, $gsapSplitText } = useNuxtApp();
  const { fadeUp, scrollTriggerAnimation } = useGsapAnimations();
  
  // Add word-wrapping styles for text animations
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      .word-split {
        display: inline-block;
        white-space: nowrap;
        margin-right: 0.1em;
      }
      .char-split {
        display: inline-block;
        position: relative;
      }
    `;
    document.head.appendChild(style);
    styleElements.value.push(style);
  }
  
  // Define scroll trigger configuration
  const scrollConfig = {
    trigger: sectionRef.value,
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none none",
  };
  
  // Create timeline for animations
  const timeline = $gsap.timeline();
  
  // Animate headline elements
  if (headlineRef.value) {
    const largeHeadings = Array.from(headlineRef.value.querySelectorAll('h1, h2'));
    const smallHeadings = Array.from(headlineRef.value.querySelectorAll('h3, h4, h5, h6'));
    
    // Character animation for large headings
    largeHeadings.forEach(heading => {
      const splitText = new $gsapSplitText(heading, { 
        type: "words,chars", 
        charsClass: "char-split",
        wordsClass: "word-split"
      });
      splitTextInstances.value.push(splitText);
      
      timeline.fromTo(
        splitText.chars,
        { opacity: 0, y: 15, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.02 },
        "-=0.3"
      );
    });
    
    // Line animation for small headings
    smallHeadings.forEach(heading => {
      const splitText = new $gsapSplitText(heading, { type: "lines" });
      splitTextInstances.value.push(splitText);
      
      timeline.fromTo(
        splitText.lines,
        { opacity: 0, y: 20, rotationX: -45 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 },
        "-=0.4"
      );
    });
  }
  
  // Animate text content
  if (textRef.value) {
    const paragraphs = Array.from(textRef.value.querySelectorAll('p'));
    
    if (paragraphs.length > 0) {
      paragraphs.forEach(paragraph => {
        const splitText = new $gsapSplitText(paragraph, { type: "lines" });
        splitTextInstances.value.push(splitText);
        
        timeline.fromTo(
          splitText.lines,
          { opacity: 0, y: 20, rotationX: -45 },
          { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 },
          "-=0.6"
        );
      });
    } else {
      timeline.add(fadeUp(textRef.value, { delay: 0.2 }), "-=0.4");
    }
  }
  
  // Animate buttons
  if (buttonsRef.value) {
    timeline.add(fadeUp(buttonsRef.value, { delay: 0.2 }), "-=0.4");
  }
  
  // Animate domain search box
  if (domainSearchRef.value) {
    timeline.fromTo(
      domainSearchRef.value,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    );
  }
  
  // Apply scroll trigger to the timeline
  const trigger = scrollTriggerAnimation(sectionRef.value, timeline, scrollConfig);
  if (trigger) scrollTriggerInstances.value.push(trigger);
  
  // Special animation for results when they appear
  const resultsAnimation = $gsap.timeline({ paused: true });
  
  // Watch for results and trigger animation when they appear
  watch(searchResults, (newResults) => {
    if (newResults.length > 0 && resultsRef.value) {
      const resultsItems = resultsRef.value.querySelectorAll('li');
      
      $gsap.fromTo(
        resultsItems,
        { opacity: 0, y: 20, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.1, 
          ease: "power2.out" 
        }
      );
    }
  });
});

// Clean up instances when the component is unmounted
onBeforeUnmount(() => {
  // Kill all ScrollTrigger instances
  scrollTriggerInstances.value.forEach(trigger => {
    if (trigger && trigger.kill) {
      trigger.kill();
    }
  });
  
  // Revert all SplitText instances
  splitTextInstances.value.forEach(splitText => {
    if (splitText && splitText.revert) {
      splitText.revert();
    }
  });
  
  // Remove any dynamically created style elements
  styleElements.value.forEach(style => {
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  });
});
</script>

<style>
/* Additional styling for the domain search component */
.form-checkbox {
  appearance: none;
  border: 1px solid #cbd5e0;
  border-radius: 0.25rem;
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.form-checkbox:checked {
  background-color: #3B82F6; /* Blue background when checked */
  border-color: #3B82F6;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.form-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3); /* Green focus ring */
}
</style>
