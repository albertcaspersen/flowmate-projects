<template>
  <footer class="bg-dark-green text-white py-16 md:pt-[100px] md:pb-10">
    <div class="container">
      <!-- Big Logo Section -->
      <div class="flex justify-center items-center mb-16">
        <Logo class="w-full h-auto text-primary"></Logo>
      </div>
      
      <!-- Main Footer Content -->
      <div class="default-grid !gap-y-12">
        <!-- Contact Information -->
        <div class="col-span-full gap-8">
          <!-- <h3 class="h3 mb-6">{{ locale === 'en' ? 'Contact Us' : 'Kontakt Os' }}</h3> -->
           <div class="flex gap-6 justify-between">
              <a v-if="companyInfo.company_email" :href="'mailto:' + companyInfo.company_email" v-html="companyInfo.company_email" class="text-2xl font-medium hover:text-primary transition-colors duration-200"></a>
              <a v-if="companyInfo.company_phone" :href="'tel:' + companyInfo.company_phone" v-html="companyInfo.company_phone" class="text-2xl font-medium hover:text-primary transition-colors duration-200"></a>
          </div>
          <div class="flex gap-6 mt-6">
            <a href="https://instagram.com/checkmatedk" target="_blank" class="hover:text-primary transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <!-- Placeholder for custom icon (to be supplied later) -->
            <a href="https://checkmate.dk" target="_blank" class="hover:text-primary transition-colors duration-200  w-fit h-fit">
            <svg width="32" height="32" viewBox="0 0 401 401" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M398.28 197.34H375.61C373.99 150.38 335.41 112.8 288.05 112.8C288.05 65.35 250.34 26.72 203.26 25.23V2.57C203.26 1.15 202.11 0 200.69 0H199.92C198.5 0 197.35 1.15 197.35 2.57V25.24C150.39 26.86 112.81 65.44 112.81 112.8C65.45 112.8 26.87 150.37 25.25 197.34H2.57C1.15 197.34 0 198.49 0 199.91V200.68C0 202.1 1.15 203.25 2.57 203.25H25.23C26.72 250.33 65.36 288.04 112.8 288.04C112.8 335.4 150.37 373.98 197.34 375.6V398.27C197.34 399.69 198.49 400.84 199.91 400.84H200.68C202.1 400.84 203.25 399.69 203.25 398.27V375.61C250.33 374.12 288.04 335.48 288.04 288.04C335.49 288.04 374.12 250.33 375.61 203.25H398.27C399.69 203.25 400.84 202.1 400.84 200.68V199.91C400.84 198.49 399.69 197.34 398.27 197.34H398.28ZM362.64 203.16C362.17 205.58 359.75 207.43 357.06 206.68L351.84 205.22C351.57 205.14 351.31 205.05 351.06 204.93L352.25 209.41C353.26 213.22 349.37 216.5 345.71 214.92C342.21 216.48 338.46 213.31 339.48 209.65L340.94 204.43C341.06 204.01 341.24 203.61 341.46 203.25H332.12C331.91 203.25 331.71 203.23 331.51 203.19C330.08 226.17 311 244.36 287.67 244.36C270.32 244.36 255.32 234.3 248.18 219.69H241.68V222.26C241.68 223.68 240.53 224.83 239.11 224.83H238.08C236.66 224.83 235.51 223.68 235.51 222.26V219.69H219.32V236.14H221.89C223.31 236.14 224.46 237.29 224.46 238.71V239.74C224.46 241.16 223.31 242.31 221.89 242.31H219.32V248.55C233.93 255.69 243.99 270.69 243.99 288.04C243.99 311.38 225.8 330.45 202.82 331.88C202.86 332.08 202.88 332.28 202.88 332.49V341.83C203.25 341.61 203.64 341.43 204.06 341.31L209.28 339.85C212.93 338.83 216.1 342.59 214.54 346.08C216.12 349.74 212.84 353.63 209.03 352.62L204.55 351.43C204.67 351.68 204.76 351.94 204.84 352.21L206.3 357.43C207.05 360.12 205.21 362.55 202.78 363.01C202.47 364.36 201.31 365.37 199.91 365.37C198.51 365.37 197.32 364.34 197.03 362.96C194.6 362.38 192.79 359.92 193.52 357.19L194.83 352.27C194.9 351.99 195 351.73 195.12 351.47L190.8 352.62C186.99 353.63 183.71 349.74 185.29 346.08C183.73 342.58 186.9 338.83 190.56 339.85L195.78 341.31C196.2 341.43 196.6 341.61 196.96 341.83V332.49C196.96 332.27 196.98 332.06 197.02 331.86C174.16 330.31 156.1 311.29 156.1 288.04C156.1 270.69 166.16 255.69 180.77 248.55V242.31H177.94C176.52 242.31 175.37 241.16 175.37 239.74V238.71C175.37 237.29 176.52 236.14 177.94 236.14H180.77V219.69H164.58V222.26C164.58 223.68 163.43 224.83 162.01 224.83H160.98C159.56 224.83 158.41 223.68 158.41 222.26V219.69H151.91C144.77 234.3 129.77 244.36 112.42 244.36C89.08 244.36 70.01 226.16 68.58 203.19C68.38 203.23 68.18 203.25 67.97 203.25H58.63C58.85 203.62 59.03 204.01 59.15 204.43L60.61 209.65C61.63 213.3 57.88 216.47 54.38 214.92C50.72 216.5 46.83 213.22 47.84 209.41L49.03 204.93C48.78 205.05 48.52 205.14 48.25 205.22L43.03 206.68C40.34 207.43 37.91 205.59 37.45 203.16C36.1 202.85 35.09 201.69 35.09 200.29C35.09 198.89 36.12 197.7 37.5 197.41C38.08 194.98 40.54 193.17 43.28 193.9L48.19 195.21C48.47 195.28 48.73 195.38 48.99 195.5L47.84 191.18C46.83 187.37 50.72 184.09 54.38 185.67C57.88 184.11 61.63 187.28 60.61 190.94L59.15 196.16C59.03 196.58 58.85 196.98 58.63 197.34H67.97C68.19 197.34 68.4 197.36 68.6 197.4C70.15 174.54 89.17 156.48 112.42 156.48C129.77 156.48 144.77 166.54 151.91 181.15H158.41V178.32C158.41 176.9 159.56 175.75 160.98 175.75H162.01C163.43 175.75 164.58 176.9 164.58 178.32V181.15H180.77V163.42H177.94C176.52 163.42 175.37 162.27 175.37 160.85V159.82C175.37 158.4 176.52 157.25 177.94 157.25H180.77V152.29C166.16 145.15 156.1 130.15 156.1 112.8C156.1 89.55 174.16 70.53 197.02 68.98C196.98 68.78 196.96 68.57 196.96 68.35V59.01C196.59 59.23 196.2 59.41 195.78 59.53L190.56 60.99C186.91 62.01 183.74 58.26 185.29 54.76C183.71 51.1 186.99 47.21 190.8 48.22L195.12 49.37C195 49.12 194.91 48.85 194.83 48.57L193.52 43.66C192.79 40.92 194.6 38.47 197.03 37.88C197.32 36.5 198.5 35.47 199.91 35.47C201.32 35.47 202.46 36.48 202.78 37.83C205.2 38.3 207.05 40.72 206.3 43.41L204.84 48.63C204.76 48.9 204.67 49.16 204.55 49.41L209.03 48.22C212.84 47.21 216.12 51.1 214.54 54.76C216.1 58.26 212.93 62.01 209.28 60.99L204.06 59.53C203.64 59.41 203.24 59.23 202.88 59.01V68.35C202.88 68.56 202.86 68.76 202.82 68.96C225.8 70.39 243.99 89.47 243.99 112.8C243.99 130.15 233.93 145.15 219.32 152.29V157.25H221.89C223.31 157.25 224.46 158.4 224.46 159.82V160.85C224.46 162.27 223.31 163.42 221.89 163.42H219.32V181.15H235.51V178.32C235.51 176.9 236.66 175.75 238.08 175.75H239.11C240.53 175.75 241.68 176.9 241.68 178.32V181.15H248.18C255.32 166.54 270.32 156.48 287.67 156.48C310.92 156.48 329.94 174.54 331.49 197.4C331.69 197.36 331.9 197.34 332.12 197.34H341.46C341.24 196.97 341.06 196.58 340.94 196.16L339.48 190.94C338.46 187.29 342.22 184.12 345.71 185.67C349.37 184.09 353.26 187.37 352.25 191.18L351.1 195.5C351.35 195.38 351.62 195.29 351.9 195.21L356.81 193.9C359.55 193.17 362 194.98 362.59 197.41C363.97 197.7 365 198.88 365 200.29C365 201.7 363.99 202.84 362.64 203.15V203.16Z" fill="currentColor"/>
            </svg>
            </a>

          </div>
        </div>
        
        <!-- Single Main Menu -->
        <!-- <div class="col-span-full md:col-span-6 md:col-start-7">
          <h3 class="h4 mb-6">{{ locale === 'en' ? 'Quick Links' : 'Hurtige Links' }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <a 
              v-for="(item, i) in (locale === 'en' ? mainMenuEn : mainMenuDa)" 
              :key="i" 
              :href="item.url" 
              class="text-lg text-white hover:text-primary transition-colors duration-200"
            >
              {{ item.title }}
            </a>
          </div>
        </div> -->
      </div>

      <!-- Bottom Section with Copyright and Language Switcher -->
      <div class="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-between items-center gap-6">
        <p class="mb-0 text-sm text-white/70">© {{ new Date().getFullYear() }} Flowmate. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useCoreStore } from "~/stores/core";
import { useI18n } from 'vue-i18n';

const coreStore = useCoreStore();
const { locale } = useI18n();

// English menu data - combined into one main menu
const mainMenuEn = [
  { title: 'About Us', url: '/about' },
  { title: 'Products', url: '/products' },
  { title: 'Features', url: '/features' },
  { title: 'Pricing', url: '/pricing' },
  { title: 'Blog', url: '/blog' },
  { title: 'Support', url: '/support' },
  { title: 'Contact', url: '/contact' },
  { title: 'Get Started', url: '/get-started' }
];

// Danish menu data
const mainMenuDa = [
  { title: 'Om Os', url: '/da/om-os' },
  { title: 'Produkter', url: '/da/produkter' },
  { title: 'Funktioner', url: '/da/funktioner' },
  { title: 'Priser', url: '/da/priser' },
  { title: 'Blog', url: '/da/blog' },
  { title: 'Support', url: '/da/support' },
  { title: 'Kontakt', url: '/da/kontakt' },
  { title: 'Kom i gang', url: '/da/kom-i-gang' }
];

// Dynamic data (keeping for reference)
const companyInfo = computed(() => {
  return coreStore.getSettings?.company_info;
});

const socialMediaChannels = computed(() => {
  return coreStore.getSettings?.social_media_channels;
});
</script>

<style scoped>

</style>
