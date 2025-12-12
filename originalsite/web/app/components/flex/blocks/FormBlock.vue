<template>
  <div class="section-container py-8 md:py-16" :class="containerClasses">
    <div class="default-grid" :class="isInSbs ? 'half-grid' : ''">
      <div class="col-span-full" :class="isInSbs ? '' : 'md:col-span-8 md:col-start-3 lg:col-start-4 lg:col-span-6'">
        <HeadlineFields class="mb-12" :data="data" :index="index"></HeadlineFields>

        <form v-if="formObj && formSuccess === false" :id="'form-' + index" @submit.prevent="submitForm" class="grid grid-cols-6 gap-x-4 gap-y-5">

          <div v-for="field in formFields" class="col-span-full" :class="{'md:col-span-6' : field.spacing === '12', 'md:col-span-3' : field.spacing === '6', 'md:col-span-2' : field.spacing === '4'}">

            <!-- LABEL -->
            <div class="mb-1">
              <label class="font-bold" :for="field.name" v-html="field.label"></label>
              <span class="px-1" v-if="field.required">*</span>
            </div>

            <!-- DIFFERENT TEXT INPUTS -->
            <input type="text" :name="field.name" :id="field.name" :required="field.required" v-model="formModels[field.name]" v-if="field.type === 'text'" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black">
            <input type="tel" :name="field.name" :id="field.name" :required="field.required"  v-model="formModels[field.name]" v-if="field.type === 'phone'" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black">
            <input type="email" name="email" :id="field.name" :required="field.required"  v-model="formModels[field.name]" v-if="field.type === 'email'" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black">
            <textarea :name="field.name" :required="field.required"  v-model="formModels[field.name]" :id="field.name" cols="30" rows="6"  v-if="field.type === 'textarea'" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"></textarea>

            <!-- SELECT -->
            <div class="select-wrap" v-if="field.type === 'select'">
              <select :name="field.name" :id="field.name" :required="field.required"  v-model="formModels[field.name]" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black">
                <option value="" selected disabled v-html="field.label"></option>
                <option :value="i" v-for="(option, i) in field.options" :key="'select-' + index + '-' + i" v-html="option.label"></option>
              </select>
            </div>
            <!-- CHECKBOXES! -->
            <div v-if="field.type === 'checkbox'" class="flex flex-col gap-y-2 pt-2">
              <div v-for="(option, i) in field.options" :key="'checkbox-' + index + '-' + i" class="flex gap-4">
                <input class="hover:cursor-pointer" type="checkbox" :id="'checkbox-' + index + '-' + i" :name="field.name" :value="i"
                       :checked="Array.isArray(formModels[field.name]) && formModels[field.name].includes(i)"
                       @change="updateCheckboxValue(field.name, i, $event.target.checked)">
                <label class="w-fit hover:cursor-pointer" :for="'checkbox-' + index + '-' + i" v-html="option.label" ></label>
              </div>

            </div>

            <!-- RADIO BUTTONS-->
            <div v-if="field.type === 'radio'" class="flex flex-wrap gap-8 items-center py-2">
              <div v-for="(option, i) in field.options" :key="'radio-' + index + '-' + i">
                <input class="cursor-pointer mr-2" :required="field.required"  type="radio" :id="'radio-' + index + '-' + i" :name="field.name" :value="i" v-model="formModels[field.name]">
                <label class="cursor-pointer" :for="'radio-' + index + '-' + i" v-html="option.label"></label>
              </div>
            </div>

          </div>
          <div class="col-span-full pt-2 flex flex-col gap-y-4">
              <div v-if="privacyPolicy.addCheckbox" class="flex items-center gap-2">
                <input type="checkbox" :id="'privacy-policy-' + index" required v-model="formModels['privacy_policy']">
                <label :for="'privacy-policy-' + index" v-html="privacyPolicy.label"></label>
              </div>
              <div>
                <button v-if="loadingForm === false && formSuccess === false" class="btn btn-solid" :class="['white', 'default'].includes(data.settings.background_color) ? 'btn-secondary' : 'btn-primary'" v-text="submitBtnText"></button>
                <div v-if="loadingForm" class="flex items-center gap-2">
                  <span class="spinner spinner-primary"></span>
                  <span>Sending...</span>
                </div>
              </div>
          </div>
        </form>

        <div v-else-if="formSuccess" class="text-center" v-html="thankYouMessage"></div>

      </div>
    </div>
  </div>
</template>

<script setup>
import {useCheckmateFlexSettings} from "~/composables/checkmateFlexSettings";
import {useFetchMate} from "~/composables/fetchMate";
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: null,
  },
  isInSbs: {
    type: Boolean,
    default: false,
  },
});

const formModels = ref({});
const formObj = ref(null);
const formFields = ref(null);

const submitBtnText = ref('Submit');
const thankYouMessage = ref('Thank you for your submission!');
const privacyPolicy = ref({
  addCheckbox: false,
  title: false,
  label: null
});
const getLink = (link) => {
  const { path } = useUrlParser(link);
  return path;
}



const fetchForm = async () => {
  const { items } = await useFetchMate([props.data.form]);
  if (items.value && items.value.length > 0) {

    formObj.value = items.value[0];
    formFields.value = formObj.value.acf?.form_fields;
    formModels.value['form_id'] = props.data.form;

    formFields.value.forEach((field) => {
      formModels.value[field.name] = '';
    });

    submitBtnText.value = formObj.value.acf?.submit_button_text;
    thankYouMessage.value = formObj.value.acf?.thank_you_message;

    if (formObj.value.acf?.add_privacy_policy) {
      privacyPolicy.value.addCheckbox = true;
      privacyPolicy.value.label = formObj.value.acf?.privacy_policy_label;
      formModels.value['privacy_policy'] = false;
      if (formObj.value.acf?.privacy_policy_link) {
        let link = '<a href="' + getLink(formObj.value.acf?.privacy_policy_link.url) + '" class="underline inline-link" target="' + formObj.value.acf?.privacy_policy_link.target + '">' + formObj.value.acf?.privacy_policy_link.title + '</a>';
        privacyPolicy.value.label = formObj.value.acf?.privacy_policy_label_text.replace('{privacy_policy_link}', link);
        privacyPolicy.value.title = formObj.value.acf?.privacy_policy_link.title;
      }
  }
  }
}

if (props.data.form) {
  fetchForm();
}

watch(() => props.data.form, async (value, oldValue) => {
  if(JSON.stringify(value) !== JSON.stringify(oldValue) && props.data.form) {
    await fetchForm();
  }
});


const updateCheckboxValue = (name, value, checked) => {
  if (checked) {
    if (!formModels.value[name]) {
      formModels.value[name] = [];
    }
    formModels.value[name].push(value);
  } else {
    formModels.value[name] = formModels.value[name].filter((item) => item !== value);
  }
}

/**
 * Container classes
 * @type {ComputedRef<*[]>}
 */
const containerClasses  = computed (() => {
  let classes = [];
  if (props.data.settings) {
    const { getContainerClasses } = useCheckmateFlexSettings(props.data.settings);
    classes = getContainerClasses('background', 'margin', 'padding', 'width', 'text');
  }
  return classes;
});


const loadingForm = ref(false);
const formSuccess = ref(false);
const formError = ref(false);

const submitForm = async () => {
  loadingForm.value = true;
  let data = JSON.parse(JSON.stringify(formModels.value));
  for (let [key, value] of Object.entries(data)) {
    if (typeof (value) === 'object') {
      data[key] = value.join(',');
    }
  }

  const result = await $fetch('/api/form/', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if(result && result.status === 'success') {
    loadingForm.value = false;
    formSuccess.value = true;
    formError.value = false;

    //Set datalayer event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'formSubmission',
      formId: props.data.form
    });
  }
}

</script>

<style scoped>
  .spinner {
    @apply inline-block w-4 h-4 border-2 border-solid border-current border-r-transparent rounded-full animate-spin;
  }
</style>
