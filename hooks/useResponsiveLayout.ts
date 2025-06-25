import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ResponsiveLayout {
  // Screen characteristics
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
  isFoldable: boolean;
  isLargeScreen: boolean;
  
  // Layout decisions
  shouldUseColumnLayout: boolean;
  shouldUseSideDrawer: boolean;
  columnCount: number;
  
  // Spacing and sizing
  contentPadding: number;
  maxContentWidth: number;
  headerHeight: number;
  
  // Insets for edge-to-edge
  insets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Task 11.4: Responsive layout hook for Android 16 compatibility
 * Handles foldables, tablets, and resizable activities
 */
export const useResponsiveLayout = (): ResponsiveLayout => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Device type detection
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const isFoldable = width >= 900; // Detect foldable/large screens
  const isLargeScreen = width >= 1024;
  
  // Layout decisions based on screen characteristics
  const shouldUseColumnLayout = isTablet && isLandscape;
  const shouldUseSideDrawer = isTablet || isFoldable;
  const columnCount = isFoldable ? 2 : 1;
  
  // Responsive spacing and sizing
  const contentPadding = isTablet ? 24 : 16;
  const maxContentWidth = isLargeScreen ? 1200 : width;
  const headerHeight = isTablet ? 72 : 56;
  
  return {
    // Screen characteristics
    width,
    height,
    isTablet,
    isLandscape,
    isFoldable,
    isLargeScreen,
    
    // Layout decisions
    shouldUseColumnLayout,
    shouldUseSideDrawer,
    columnCount,
    
    // Spacing and sizing
    contentPadding,
    maxContentWidth,
    headerHeight,
    
    // Insets for edge-to-edge
    insets: {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
    },
  };
};

/**
 * Task 11.4: Get responsive styles based on layout
 */
export const useResponsiveStyles = () => {
  const layout = useResponsiveLayout();
  
  return {
    container: {
      flex: 1,
      paddingHorizontal: layout.contentPadding,
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center' as const,
    },
    
    columnContainer: layout.shouldUseColumnLayout ? {
      flexDirection: 'row' as const,
      gap: 24,
    } : {},
    
    column: layout.shouldUseColumnLayout ? {
      flex: 1,
      minWidth: 300,
    } : {},
    
    header: {
      height: layout.headerHeight,
      paddingTop: layout.insets.top,
    },
    
    content: {
      paddingBottom: layout.insets.bottom,
    },
    
    // Email list specific styles
    emailList: layout.shouldUseColumnLayout ? {
      flex: 0.4, // 40% width on large screens
      minWidth: 350,
      maxWidth: 500,
    } : {},
    
    emailDetail: layout.shouldUseColumnLayout ? {
      flex: 0.6, // 60% width on large screens
      minWidth: 400,
    } : {},
  };
}; 