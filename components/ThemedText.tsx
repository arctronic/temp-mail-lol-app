import { useThemeColor } from '@/hooks/useThemeColor';
import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className = '',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Map type to styles
  let typeStyle = {};
  switch (type) {
    case 'title':
      typeStyle = { fontSize: 32, fontWeight: 'bold', lineHeight: 32 };
      break;
    case 'defaultSemiBold':
      typeStyle = { fontSize: 16, lineHeight: 24, fontWeight: '600' };
      break;
    case 'subtitle':
      typeStyle = { fontSize: 20, fontWeight: 'bold' };
      break;
    case 'link':
      typeStyle = { lineHeight: 30, fontSize: 16, color: '#0a7ea4' };
      break;
    default:
      typeStyle = { fontSize: 16, lineHeight: 24 };
      break;
  }

  return (
    <Text
      style={[{ color }, typeStyle, style]}
      {...rest}
    />
  );
}
