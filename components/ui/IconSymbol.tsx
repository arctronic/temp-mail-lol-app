// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Define the icon names we use in our app
type IconName = 
  | 'house.fill' 
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'chevron.up'
  | 'chevron.down'
  | 'chevron.left'
  | 'xmark'
  | 'line.3.horizontal'
  | 'info.circle.fill'
  | 'doc.text.fill'
  | 'envelope.fill'
  | 'envelope'
  | 'questionmark.circle.fill'
  | 'lock.shield.fill'
  | 'doc.plaintext.fill'
  | 'gear'
  | 'sun.max.fill'
  | 'moon.fill'
  | 'checkmark.circle.fill'
  | 'arrow.up'
  | 'arrow.down'
  | 'arrow.clockwise'
  | 'exclamationmark.triangle'
  | 'exclamationmark.triangle.fill'
  | 'tray'
  | 'tray.fill'
  | 'paperclip'
  | 'doc.on.doc'
  | 'qrcode'
  | 'trash'
  | 'square.and.arrow.up'
  | 'arrowshape.turn.up.left.fill'
  | 'doc'
  | 'arrow.down.circle'
  | 'list.bullet.clipboard.fill'
  | 'at'
  | 'envelope.badge'
  | 'plus';

/**
 * Mapping from SF Symbols to Material Icons.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, string> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.up': 'keyboard-arrow-up',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.left': 'chevron-left',
  'xmark': 'close',
  'line.3.horizontal': 'menu',
  'info.circle.fill': 'info',
  'doc.text.fill': 'description',
  'envelope.fill': 'email',
  'envelope': 'mail',
  'questionmark.circle.fill': 'help',
  'lock.shield.fill': 'security',
  'doc.plaintext.fill': 'article',
  'gear': 'settings',
  'sun.max.fill': 'light-mode',
  'moon.fill': 'dark-mode',
  'checkmark.circle.fill': 'check-circle',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward',
  'arrow.clockwise': 'refresh',
  'exclamationmark.triangle': 'warning',
  'exclamationmark.triangle.fill': 'warning',
  'tray': 'inbox',
  'tray.fill': 'inbox',
  'paperclip': 'attach-file',
  'doc.on.doc': 'content-copy',
  'qrcode': 'qr-code',
  'trash': 'delete',
  'square.and.arrow.up': 'share',
  'arrowshape.turn.up.left.fill': 'reply',
  'doc': 'insert-drive-file',
  'arrow.down.circle': 'download',
  'list.bullet.clipboard.fill': 'bookmarks',
  'at': 'alternate-email',
  'envelope.badge': 'mark_email_unread',
  'plus': 'add'
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Use a fallback icon if no mapping
  const mappedName = MAPPING[name] || 'circle';
  return <MaterialIcons color={color} size={size} name={mappedName as any} style={style} />;
}
