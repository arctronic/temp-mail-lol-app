import { Drawer } from 'expo-router/drawer';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { AppDrawer } from '../../components/ui/AppDrawer';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useThemePreference } from '../../contexts/ThemeContext';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function DrawerLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { activeTheme } = useThemePreference();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  
  // Animation value for menu button
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  
  // Force re-render on theme change
  useEffect(() => {
    // This is just to ensure the component re-renders when theme changes
    console.log('Current theme in drawer:', activeTheme);
  }, [activeTheme]);
  
  const toggleDrawer = () => {
    if (isDrawerOpen) {
      // Animate back to normal
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate to X
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    setIsDrawerOpen(!isDrawerOpen);
  };
  
  // Interpolate rotation value
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor }}>
      <Drawer
        screenOptions={{
          headerStyle: {
            backgroundColor: backgroundColor,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
          },
          headerTintColor: textColor,
          headerShadowVisible: false,
          drawerStyle: {
            backgroundColor: backgroundColor,
            borderRightColor: borderColor,
            borderRightWidth: 1,
          },
          drawerActiveTintColor: tintColor,
          drawerInactiveTintColor: textColor,
          headerLeft: () => (
            <Pressable
              style={({ pressed }) => [
                styles.menuButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={toggleDrawer}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <IconSymbol name="line.3.horizontal" size={24} color={tintColor} />
              </Animated.View>
            </Pressable>
          ),
        }}
        drawerContent={() => null} // Hide the default drawer content
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Temp Mail',
            drawerLabel: 'Home',
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Settings',
            drawerLabel: 'Settings',
          }}
        />
        <Drawer.Screen
          name="about"
          options={{
            title: 'About',
            drawerLabel: 'About',
          }}
        />
        <Drawer.Screen
          name="blog"
          options={{
            title: 'Blog',
            drawerLabel: 'Blog',
          }}
        />
        <Drawer.Screen
          name="contact"
          options={{
            title: 'Contact',
            drawerLabel: 'Contact',
          }}
        />
        <Drawer.Screen
          name="faq"
          options={{
            title: 'FAQ',
            drawerLabel: 'FAQ',
          }}
        />
        <Drawer.Screen
          name="privacy"
          options={{
            title: 'Privacy Policy',
            drawerLabel: 'Privacy Policy',
          }}
        />
        <Drawer.Screen
          name="terms"
          options={{
            title: 'Terms of Service',
            drawerLabel: 'Terms of Service',
          }}
        />
      </Drawer>
      
      {/* Our custom drawer */}
      {isDrawerOpen && (
        <AppDrawer onClose={toggleDrawer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
  },
}); 