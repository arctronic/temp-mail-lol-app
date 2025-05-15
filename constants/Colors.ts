/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Color palette for the app. These colors are defined for both light and dark mode.
 * The app uses a consistent color scheme across all components.
 */

// Main accent colors
const primaryColorLight = '#1a73e8'; // Google blue
const primaryColorDark = '#8ab4f8'; // Light blue for dark mode
const secondaryColorLight = '#4285f4'; // Secondary blue
const secondaryColorDark = '#669df6'; // Secondary blue for dark mode

// Backgrounds
const backgroundLight = '#ffffff';
const backgroundDark = '#121212';
const surfaceLight = '#f8f9fa';
const surfaceDark = '#1e1e1e';

// Enhanced semantic colors
const warningLight = '#ea4335'; // Red
const warningDark = '#f28b82'; // Light red
const successLight = '#0f9d58'; // Green
const successDark = '#81c995'; // Light green

export const Colors = {
  light: {
    text: '#202124',
    textSecondary: '#5f6368',
    background: backgroundLight,
    backgroundSecondary: surfaceLight,
    tint: primaryColorLight,
    tintSecondary: secondaryColorLight,
    icon: '#444746',
    tabIconDefault: '#9aa0a6',
    tabIconSelected: primaryColorLight,
    border: '#dadce0',
    warning: warningLight,
    success: successLight,
    card: '#ffffff',
    shadow: 'rgba(60, 64, 67, 0.2)',
    overlay: 'rgba(32, 33, 36, 0.4)',
    separator: '#f1f3f4',
    highlight: '#e8f0fe',
  },
  dark: {
    text: '#e8eaed',
    textSecondary: '#9aa0a6',
    background: backgroundDark,
    backgroundSecondary: surfaceDark,
    tint: primaryColorDark,
    tintSecondary: secondaryColorDark,
    icon: '#dadce0',
    tabIconDefault: '#5f6368',
    tabIconSelected: primaryColorDark,
    border: '#3c4043',
    warning: warningDark,
    success: successDark,
    card: '#2d2d2d',
    shadow: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    separator: '#303134',
    highlight: '#293c54',
  },
};
