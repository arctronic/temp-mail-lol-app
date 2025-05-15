/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useThemePreference } from '@/contexts/ThemeContext';

type ThemeColorName = 
  | 'text' 
  | 'textSecondary'
  | 'background' 
  | 'backgroundSecondary'
  | 'tint' 
  | 'tintSecondary'
  | 'icon' 
  | 'tabIconDefault' 
  | 'tabIconSelected'
  | 'border'
  | 'warning'
  | 'success'
  | 'card'
  | 'shadow'
  | 'overlay';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColorName
) {
  const { activeTheme } = useThemePreference();
  const theme = activeTheme;

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName] ?? '#000000';
  }
}
