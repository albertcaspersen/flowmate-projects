/**
 * Type definition for flex settings
 */
interface FlexSettings {
  background_color?: string;
  text_color?: string;
  custom_margin?: {
    margin_top_option?: string;
    margin_right_option?: string;
    margin_bottom_option?: string;
    margin_left_option?: string;
  };
  custom_padding?: {
    padding_top_option?: string;
    padding_right_option?: string;
    padding_bottom_option?: string;
    padding_left_option?: string;
  };
  container_setting?: string;
  [key: string]: any; // Allow for other properties
}

/**
 * Composable that can be used to set up page components for Singles.
 */
export const useCheckmateFlexSettings = (settings: object) => {

// new stuff:
const containerBackgroundColorStyle = computed(() => {
    if (!settings.hasOwnProperty('background_color')) {
        return [];
    }
    const backgroundColor = settings.background_color;
    // Return both a class and the CSS variable
    return [`bg-${backgroundColor}`, `--section-bg-color:var(--color-${backgroundColor});`];
});


    // new stuff
    const containerTextColorStyle  = computed (() => {
        if (!settings.hasOwnProperty('text_color')) {
            return [];
        }
        const textColor = settings.text_color;
        // Return both a class and the CSS variable
        return [`text-${textColor}`, `--section-text-color:var(--color-${textColor});`];
    });

    /**
     * Get container margin classes.
     */
    const containerMarginClasses  = computed (() => {

        if (!settings.hasOwnProperty('custom_margin')) {
            return [];
        }

        let classes = [];

        // Margin top.
        if (settings.custom_margin.margin_top_option) {
            classes.push('cm-mt-' + settings.custom_margin.margin_top_option);
        }

        // Margin right.
        if (settings.custom_margin.margin_right_option) {
            classes.push('cm-mr-' + settings.custom_margin.margin_right_option);
        }

        // Margin bottom.
        if (settings.custom_margin.margin_bottom_option) {
            classes.push('cm-mb-' + settings.custom_margin.margin_bottom_option);
        }

        // Margin left.
        if (settings.custom_margin.margin_left_option) {
            classes.push('cm-ml-' + settings.custom_margin.margin_left_option);
        }

        return classes;
    });

    /**
     * Get container padding classes.
     */
    const containerPaddingClasses  = computed (() => {
        if (!settings.hasOwnProperty('custom_padding')) {
            return [];
        }

        let classes = [];

        // Padding top
        if (settings.custom_padding.padding_top_option) {
            classes.push('cm-pt-' + settings.custom_padding.padding_top_option);
        }
        // Padding right
        if (settings.custom_padding.padding_right_option) {
            classes.push('cm-pr-' + settings.custom_padding.padding_right_option);
        }
        // Padding bottom
        if (settings.custom_padding.padding_bottom_option) {
            classes.push('cm-pb-' + settings.custom_padding.padding_bottom_option);
        }
        // Padding left
        if (settings.custom_padding.padding_left_option) {
            classes.push('cm-pl-' + settings.custom_padding.padding_left_option);
        }

        return classes;
    });

    const containerWidthClass  = computed (() => {
        if (!settings.hasOwnProperty('container_setting')) {
            return [];
        }

        if(settings.container_setting !== 'contained') {
            return [];
        }

        return ['cm-contained'];
    });

    /**
     * Get specific container classes. based on the class types.
     * @param classTypes
     */
    const getContainerClasses = ( ...classTypes ) => {
        let classes = [];

        // Get container widht classes.
        if (classTypes.length === 0 || classTypes.some( item =>  ['width', 'containerWidthClass'].includes(item))) {
            classes.push(... containerWidthClass.value);
        }
        // Get padding classes.
        if (classTypes.length === 0 || classTypes.some(item =>  ['padding', 'containerPaddingClasses'].includes(item))) {
            classes.push(... containerPaddingClasses.value);
        }
        // Get margin classes.
        if (classTypes.length === 0 || classTypes.some(item =>  ['margin', 'containerMarginClasses'].includes(item))) {
            classes.push(... containerMarginClasses.value);
        }

        return classes;
    }

    const getContainerStyles = ( ...styleTypes ) => {
        let styles = [];
        let classes = [];

        // Get background classes.
        if (styleTypes.length === 0 || styleTypes.some(item => ['background'].includes(item))) {
            const bgStyles = containerBackgroundColorStyle.value;
            // Separate classes from styles
            if (bgStyles.length > 0) {
                classes.push(bgStyles[0]); // Class name
                styles.push(bgStyles[1]);  // CSS variable
            }
        }
        
        // Get text classes.
        if (styleTypes.length === 0 || styleTypes.some(item => ['text'].includes(item))) {
            const textStyles = containerTextColorStyle.value;
            // Separate classes from styles
            if (textStyles.length > 0) {
                classes.push(textStyles[0]); // Class name
                styles.push(textStyles[1]);  // CSS variable
            }
        }

        return {
            style: styles.join(' '),
            class: classes.join(' ')
        };
    }

    return {
        getContainerClasses,
        getContainerStyles,
        containerPaddingClasses,
        containerMarginClasses,
        containerWidthClass,
    }
}
