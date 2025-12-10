import { ref, provide, inject } from 'vue';

const LOCALE_KEY = 'flowmate_locale';
const DEFAULT_LOCALE = 'da';

// Oversættelsesdata
const translations = {
  da: {
    // Navbar
    'nav.getStarted': 'Kom i gang',
    'nav.tryNow': 'Prøv nu',
    'nav.english': 'English',
    
    // Hero Section
    'hero.eyebrow': 'FLOWMATE REALTIME EDITOR',
    'hero.title': 'Flowmate er din nye bedste ven.',
    'hero.subtitle': 'Nåh ja, og realtime frontend editor til headless websites.',
    'hero.scroll': 'Scroll Ned',
    
    // Content Management Section
    'content.title': 'Flowmate gør websites og content management enkelt. Vi klarer design, udvikling, hosting og sikkerhed, så du kan skabe flotte og velfungerende sites uden besvær.',
    
    // Features Section
    'features.eyebrow': 'Features',
    'features.title': 'Alt hvad du har brug for, samlet ét sted',
    
    // Flowmate AI Section
    'ai.eyebrow': 'FLOWMATE MED AI',
    'ai.title': 'Med Flowmates AI bliver du endnu mere effektiv.',
    'ai.description': 'Ved hånden har du altid vores AI, som assisterer dig med at skabe lige netop dét, som du ønsker. Om du skal skrive tekster, gentænke sidens brugerrejse eller bare få kreative inputs, så hjælper Flowmates AI dig hurtigt og effektivt.',
    'ai.button': 'Prøv i dag',
    
    // Quote Section
    'quote.text': '"Med Flowmate er det blevet nemmere end nogenside at redigere vores website."',
    'quote.author': 'Katrine S. Hansen, Social Media & PR',
    
    // Domain Check Section
    'domain.eyebrow': 'DOMAIN CHECKER',
    'domain.title.part1': 'Lad os komme i gang -',
    'domain.title.part2': 'hvad er dit domæne?',
    'domain.placeholder': 'Indtast domænenavn',
    'domain.check': 'Tjek',
    'domain.available': 'Domænet er ledigt!',
    'domain.availableText': 'er tilgængeligt',
    'domain.taken': 'Domænet er taget',
    'domain.takenText': 'er allerede registreret',
    'domain.error': 'Indtast venligst et domænenavn',
    'domain.errorInvalid': 'Ugyldigt domænenavn. Brug kun bogstaver, tal og bindestreger',
    'domain.checking': 'Tjekker domæne...',
    'domain.errorCheck': 'Der opstod en fejl ved tjekket. Prøv igen senere.',
    'domain.errorAlternative': 'Kunne ikke tjekke domænet. Prøv igen eller kontakt os direkte.',
    
    // FAQ Section
    'faq.eyebrow': 'FAQ',
    'faq.title': 'Spørgsmål & svar',
    'faq.items': [
      {
        question: 'Hvad er Flowmate?',
        answer: 'Flowmate er en realtime frontend editor til headless websites, der gør det nemt at redigere og opdatere dit website uden tekniske vanskeligheder.'
      },
      {
        question: 'Hvad består et Flowmate-site af?',
        answer: 'Et Flowmate-site består af moderne headless teknologi, der kombinerer fleksibilitet med nem redigering. Vi håndterer design, udvikling, hosting og sikkerhed.'
      },
      {
        question: 'Hvordan fungerer Flowmate i praksis?',
        answer: 'Med Flowmates realtime editor kan du se ændringer med det samme, mens du redigerer. Det er intuitivt og kræver ingen tekniske færdigheder.'
      },
      {
        question: 'Hvem er Flowmate til?',
        answer: 'Flowmate er perfekt til virksomheder, der vil have et professionelt website uden hovedpiner. Vi klarer alt det tekniske, så du kan fokusere på din forretning.'
      },
      {
        question: 'Hvor hurtigt kan jeg komme i gang?',
        answer: 'Du kan komme i gang hurtigt! Kontakt os, og vi finder en løsning, der passer til dine behov og tidslinje.'
      },
      {
        question: 'Hvordan adskiller Flowmate sig fra andre website builders?',
        answer: 'Flowmate kombinerer fleksibiliteten i headless teknologi med nemheden i en realtime editor. Vi håndterer også hosting, compliance og sikkerhed, så du ikke skal bekymre dig om tekniske detaljer.'
      }
    ],
    
    // Footer
    'footer.copyright': '© 2025 Flowmate. All rights reserved.',
    
    // Feature Boxes
    'features.box1.title': 'Nemt og uden bøvl',
    'features.box1.description': 'Med Flowmate tager vi os af design og opdatering af indhold. Du kan læne dig tilbage, slappe af og fokusere på din forretning.',
    'features.box2.title': 'Hosting og sikkerhed',
    'features.box2.description': 'Vi håndterer hosting og sikkerhed, så du ikke behøver at bekymre dig om tekniske detaljer. Alt kører sikkert og stabilt i baggrunden.',
    'features.box3.title': 'Altid klar til at hjælpe',
    'features.box3.description': 'Vi er her, når du har brug for os med hurtige svar og rigtige mennesker i den anden ende. Dine spørgsmål er vigtige, så vi leverer kreativ teknologi med menneskelig tilgang.',
    'features.box4.title': 'Fleksibel redigering',
    'features.box4.description': 'Opdatér dit indhold, når det passer dig. Vi klarer det gerne for dig, eller du kan selv tage styringen med Flowmates realtime editor.',
  },
  en: {
    // Navbar
    'nav.getStarted': 'Get Started',
    'nav.tryNow': 'Try Now',
    'nav.english': 'Dansk',
    
    // Hero Section
    'hero.eyebrow': 'FLOWMATE REALTIME EDITOR',
    'hero.title': 'Flowmate is your new best friend.',
    'hero.subtitle': 'Oh, and a realtime frontend editor for headless websites.',
    'hero.scroll': 'Scroll down',
    
    // Content Management Section
    'content.title': 'Flowmate makes websites and content management simple. We handle design, development, hosting, and security, so you can create beautiful and functional sites without hassle.',
    
    // Features Section
    'features.eyebrow': 'Features',
    'features.title': 'Everything you need, all in one place',
    
    // Flowmate AI Section
    'ai.eyebrow': 'FLOWMATE WITH AI',
    'ai.title': 'Your AI assistant is always at hand',
    'ai.description': 'At hand, you always have our AI, which assists you in creating exactly what you want. Whether you need to write texts, rethink the site\'s user journey, or just get creative inputs, Flowmate\'s AI helps you quickly and efficiently.',
    'ai.button': 'Try today',
    
    // Quote Section
    'quote.text': '"With Flowmate, it has become easier than ever to edit our website."',
    'quote.author': 'Katrine S. Hansen, Social Media & PR',
    
    // Domain Check Section
    'domain.eyebrow': 'DOMAIN CHECKER',
    'domain.title.part1': 'Let\'s get started -',
    'domain.title.part2': 'what\'s your domain?',
    'domain.placeholder': 'Enter domain name',
    'domain.check': 'Check',
    'domain.available': 'Domain is available!',
    'domain.availableText': 'is available',
    'domain.taken': 'Domain is taken',
    'domain.takenText': 'is already registered',
    'domain.error': 'Please enter a domain name',
    'domain.errorInvalid': 'Invalid domain name. Use only letters, numbers, and hyphens',
    'domain.checking': 'Checking domain...',
    'domain.errorCheck': 'An error occurred during the check. Please try again later.',
    'domain.errorAlternative': 'Could not check the domain. Please try again or contact us directly.',
    
    // FAQ Section
    'faq.eyebrow': 'FAQ',
    'faq.title': 'Questions & Answers',
    'faq.items': [
      {
        question: 'What is Flowmate?',
        answer: 'Flowmate is a realtime frontend editor for headless websites that makes it easy to edit and update your website without technical difficulties.'
      },
      {
        question: 'What does a Flowmate site consist of?',
        answer: 'A Flowmate site consists of modern headless technology that combines flexibility with easy editing. We handle design, development, hosting, and security.'
      },
      {
        question: 'How does Flowmate work in practice?',
        answer: 'With Flowmate\'s realtime editor, you can see changes instantly as you edit. It\'s intuitive and requires no technical skills.'
      },
      {
        question: 'Who is Flowmate for?',
        answer: 'Flowmate is perfect for businesses that want a professional website without headaches. We handle all the technical aspects so you can focus on your business.'
      },
      {
        question: 'How quickly can I get started?',
        answer: 'You can get started quickly! Contact us, and we\'ll find a solution that fits your needs and timeline.'
      },
      {
        question: 'How does Flowmate differ from other website builders?',
        answer: 'Flowmate combines the flexibility of headless technology with the ease of a realtime editor. We also handle hosting, compliance, and security, so you don\'t have to worry about technical details.'
      }
    ],
    
    // Footer
    'footer.copyright': '© 2025 Flowmate. All rights reserved.',
    
    // Feature Boxes
    'features.box1.title': 'Easy and hassle-free',
    'features.box1.description': 'With Flowmate, we take care of design and content updates. You can lean back, relax, and focus on your business.',
    'features.box2.title': 'Hosting and security',
    'features.box2.description': 'We handle hosting and security, so you don\'t need to worry about technical details. Everything runs safely and stably in the background.',
    'features.box3.title': 'Always ready to help',
    'features.box3.description': 'We\'re here when you need us with quick answers and real people on the other end. Your questions matter, so we deliver creative technology with a human approach.',
    'features.box4.title': 'Flexible editing',
    'features.box4.description': 'Update your content when it suits you. We\'re happy to do it for you, or you can take control yourself with Flowmate\'s realtime editor.',
  }
};

// Reactive locale state
const locale = ref(DEFAULT_LOCALE);

// Initialize locale from localStorage
const initLocale = () => {
  const savedLocale = localStorage.getItem(LOCALE_KEY);
  if (savedLocale && translations[savedLocale]) {
    locale.value = savedLocale;
  }
};

// Set locale and save to localStorage
const setLocale = (newLocale) => {
  if (translations[newLocale]) {
    locale.value = newLocale;
    localStorage.setItem(LOCALE_KEY, newLocale);
    // Reload page to apply translations
    window.location.reload();
  }
};

// Get translation function
const t = (key) => {
  return translations[locale.value]?.[key] || key;
};

// Initialize on import
initLocale();

// Composable function
export function useI18n() {
  return {
    locale,
    setLocale,
    t,
    translations
  };
}

// Provide function for app-wide access
export function provideI18n() {
  const i18n = useI18n();
  provide('i18n', i18n);
  return i18n;
}

// Inject function for components
export function injectI18n() {
  const i18n = inject('i18n', null);
  if (!i18n) {
    // Fallback if not provided
    return useI18n();
  }
  return i18n;
}

