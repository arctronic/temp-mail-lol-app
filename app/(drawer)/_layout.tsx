import { Drawer } from 'expo-router/drawer';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppDrawer } from '../../components/ui/AppDrawer';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useThemePreference } from '../../contexts/ThemeContext';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function DrawerLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const insets = useSafeAreaInsets();
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
            height: 60 + insets.top,  // Increase header height accounting for safe area
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
                { 
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: pressed ? `${tintColor}10` : 'transparent',
                  marginTop: insets.top, // Move paddingTop here instead
                }
              ]}
              onPress={toggleDrawer}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <IconSymbol 
                  name="line.3.horizontal" 
                  size={28} 
                  color={tintColor} 
                  style={styles.menuIcon} 
                />
              </Animated.View>
            </Pressable>
          ),
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: 'bold',
            marginTop: insets.top, // Add margin for safe area to title
          },
        }}
        drawerContent={() => null} // Hide the default drawer content
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "Temp Mail",
          }}
        />
        <Drawer.Screen
          name="lookup"
          options={{
            title: "My Lookup List",
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
        <Drawer.Screen
          name="blog"
          options={{
            title: "Blog",
          }}
        />
        <Drawer.Screen
          name="about"
          options={{
            title: "About",
          }}
        />
        <Drawer.Screen
          name="faq"
          options={{
            title: "FAQ",
          }}
        />
        <Drawer.Screen
          name="terms"
          options={{
            title: "Terms",
          }}
        />
        <Drawer.Screen
          name="privacy"
          options={{
            title: "Privacy",
          }}
        />
        <Drawer.Screen
          name="contact"
          options={{
            title: "Contact",
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
    padding: 10,
    marginLeft: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  menuIcon: {
    marginLeft: 1, // Fine adjustment for icon alignment
  }
}); 