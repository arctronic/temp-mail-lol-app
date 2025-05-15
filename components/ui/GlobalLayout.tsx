import { usePathname } from 'expo-router';
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { FloatingInboxButton } from './FloatingInboxButton';

interface GlobalLayoutProps {
  children: ReactNode;
}

export const GlobalLayout = ({ children }: GlobalLayoutProps) => {
  const pathname = usePathname();
  
  return (
    <View style={styles.container}>
      {children}
      <FloatingInboxButton currentRoute={pathname} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 