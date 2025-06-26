import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEmail } from '../../contexts/EmailContext';
import { useThemePreference } from '../../contexts/ThemeContext';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from './IconSymbol';

interface DrawerItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

const drawerItems: DrawerItem[] = [
  {
    label: 'Home',
    icon: 'house.fill',
    route: '/(drawer)',
  },
  {
    label: 'My Lookup List',
    icon: 'list.bullet.clipboard.fill',
    route: '/lookup',
  },
  {
    label: 'Settings',
    icon: 'gear',
    route: '/settings',
  },
  {
    label: 'About',
    icon: 'info.circle.fill',
    route: '/about',
  },
  {
    label: 'Blog',
    icon: 'doc.text.fill',
    route: '/blog',
  },
  {
    label: 'Contact',
    icon: 'envelope.fill',
    route: '/contact',
  },
  {
    label: 'FAQ',
    icon: 'questionmark.circle.fill',
    route: '/faq',
  },
  {
    label: 'Privacy Policy',
    icon: 'lock.shield.fill',
    route: '/privacy',
  },
  {
    label: 'Terms of Service',
    icon: 'doc.plaintext.fill',
    route: '/terms',
  },
];

interface AppDrawerProps {
  onClose: () => void;
}

export const AppDrawer = ({ onClose }: AppDrawerProps) => {
  const router = useRouter();
  const { generatedEmail } = useEmail();
  const { themeVersion } = useThemePreference();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  // Use background color with opacity for pressed states
  const pressedColor = `${backgroundColor}80`;
  
  // Animation values
  const slideAnim = React.useRef(new Animated.Value(-320)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handleClose = () => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Start exit animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -320,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleNavigation = (route: string) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Start exit animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -320,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Use type assertion to handle the route type
      router.push(route as any);
      onClose();
    });
  };

  const getInitial = () => {
    if (!generatedEmail) return "T";
    return generatedEmail.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.overlay} key={`drawer-${themeVersion}`}>
      {/* Backdrop blur and opacity */}
      <Animated.View 
        style={[
          styles.backdrop, 
          { opacity: opacityAnim }
        ]}
      >
        <BlurView intensity={15} style={StyleSheet.absoluteFill} />
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={handleClose}
        />
      </Animated.View>
      
      {/* Drawer content */}
      <Animated.View 
        style={[
          styles.container, 
          { 
            backgroundColor, 
            transform: [{ translateX: slideAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 10,
          }
        ]}
      >
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <View style={styles.headerContent}>
            <View style={[styles.avatar, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.avatarText}>{getInitial()}</ThemedText>
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.title}>Temp Mail</ThemedText>
              {generatedEmail && (
                <ThemedText style={styles.email} numberOfLines={1}>
                  {generatedEmail}
                </ThemedText>
              )}
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { 
                opacity: pressed ? 0.7 : 1,
                backgroundColor: pressed ? pressedColor : 'transparent'
              }
            ]}
            onPress={handleClose}
          >
            <IconSymbol name="xmark" size={22} color={textColor} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} bounces={false}>
          <View style={styles.section}>
            {drawerItems.map((item, index) => (
              <Pressable
                key={item.route}
                style={({ pressed }) => [
                  styles.item,
                  { 
                    backgroundColor: pressed ? pressedColor : 'transparent',
                    borderBottomColor: borderColor,
                    borderBottomWidth: index < drawerItems.length - 1 ? StyleSheet.hairlineWidth : 0,
                  }
                ]}
                onPress={() => handleNavigation(item.route)}
              >
                <View style={styles.itemContent}>
                  <IconSymbol name={item.icon as any} size={20} color={tintColor} />
                  <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
                </View>
                {item.badge ? (
                  <View style={[styles.badge, { backgroundColor: tintColor }]}>
                    <ThemedText style={styles.badgeText}>{item.badge}</ThemedText>
                  </View>
                ) : (
                  <IconSymbol name="chevron.right" size={16} color={textColor} />
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
        
        <View style={[styles.footer, { borderTopColor: borderColor }]}>
                  <ThemedText style={styles.version}>Temp Mail v1.0.1</ThemedText>
        <ThemedText style={styles.copyright}>© 2024 Temp Mail Services</ThemedText>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    flex: 1,
    width: '85%',
    maxWidth: 320,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    opacity: 0.7,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
    marginRight: -6,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 0,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemLabel: {
    fontSize: 15,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 10,
    opacity: 0.5,
  },
}); 