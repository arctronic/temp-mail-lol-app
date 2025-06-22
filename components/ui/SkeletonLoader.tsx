import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

// Base skeleton component with shimmer animation
export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}: SkeletonLoaderProps) {
  const backgroundColor = useThemeColor({}, 'border');
  const shimmerValue = new Animated.Value(0);

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Email list item skeleton
export function EmailItemSkeleton() {
  const borderColor = useThemeColor({}, 'border');
  
  return (
    <View style={[styles.emailItem, { borderBottomColor: borderColor }]}>
      <View style={styles.emailItemHeader}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={styles.emailItemContent}>
          <View style={styles.emailItemTop}>
            <SkeletonLoader width="60%" height={16} />
            <SkeletonLoader width={60} height={14} />
          </View>
          <SkeletonLoader width="80%" height={14} style={{ marginTop: 6 }} />
          <SkeletonLoader width="90%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

// Email content skeleton
export function EmailContentSkeleton() {
  return (
    <View style={styles.emailContent}>
      <View style={styles.emailHeader}>
        <SkeletonLoader width="70%" height={20} />
        <SkeletonLoader width="40%" height={14} style={{ marginTop: 8 }} />
      </View>
      
      <View style={styles.senderSection}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={styles.senderInfo}>
          <SkeletonLoader width="50%" height={16} />
          <SkeletonLoader width="70%" height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
      
      <View style={styles.messageContent}>
        <SkeletonLoader width="100%" height={14} />
        <SkeletonLoader width="95%" height={14} style={{ marginTop: 8 }} />
        <SkeletonLoader width="85%" height={14} style={{ marginTop: 8 }} />
        <SkeletonLoader width="90%" height={14} style={{ marginTop: 8 }} />
        <SkeletonLoader width="60%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

// Settings list skeleton
export function SettingsListSkeleton() {
  return (
    <View style={styles.settingsList}>
      {Array.from({ length: 4 }, (_, index) => (
        <View key={index} style={styles.settingsItem}>
          <View style={styles.settingsItemLeft}>
            <SkeletonLoader width={24} height={24} borderRadius={4} />
            <View style={styles.settingsItemText}>
              <SkeletonLoader width="60%" height={16} />
              <SkeletonLoader width="80%" height={12} style={{ marginTop: 4 }} />
            </View>
          </View>
          <SkeletonLoader width={50} height={30} borderRadius={15} />
        </View>
      ))}
    </View>
  );
}

// Lookup email list skeleton
export function LookupEmailSkeleton() {
  return (
    <View style={styles.lookupContainer}>
      {Array.from({ length: 3 }, (_, index) => (
        <View key={index} style={styles.lookupItem}>
          <View style={styles.lookupHeader}>
            <SkeletonLoader width="70%" height={16} />
            <SkeletonLoader width={20} height={20} borderRadius={10} />
          </View>
          <SkeletonLoader width="40%" height={12} style={{ marginTop: 4 }} />
          <SkeletonLoader width="60%" height={12} style={{ marginTop: 2 }} />
        </View>
      ))}
    </View>
  );
}

// Attachment skeleton
export function AttachmentSkeleton() {
  return (
    <View style={styles.attachmentContainer}>
      <View style={styles.attachmentItem}>
        <SkeletonLoader width={40} height={40} borderRadius={8} />
        <View style={styles.attachmentInfo}>
          <SkeletonLoader width="60%" height={14} />
          <SkeletonLoader width="40%" height={12} style={{ marginTop: 4 }} />
        </View>
        <SkeletonLoader width={24} height={24} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Email item skeleton styles
  emailItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emailItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  emailItemContent: {
    flex: 1,
  },
  emailItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Email content skeleton styles
  emailContent: {
    padding: 20,
  },
  emailHeader: {
    marginBottom: 16,
  },
  senderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  senderInfo: {
    flex: 1,
  },
  messageContent: {
    gap: 0,
  },

  // Settings skeleton styles
  settingsList: {
    padding: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingsItemText: {
    flex: 1,
  },

  // Lookup skeleton styles
  lookupContainer: {
    padding: 16,
  },
  lookupItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  lookupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Attachment skeleton styles
  attachmentContainer: {
    padding: 16,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  attachmentInfo: {
    flex: 1,
  },
}); 