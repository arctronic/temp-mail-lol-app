import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AppHeaderProps {
  title: string;
  leftIcon?: string;
  rightIcons?: Array<{
    name: string;
    onPress?: () => void;
  }>;
  subtitle?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  leftIcon,
  rightIcons = [],
  subtitle,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.leftContainer}>
        {leftIcon && (
          <Icon 
            name={leftIcon} 
            size={24} 
            color={theme.colors.primary}
            style={styles.leftIcon}
          />
        )}
        <View style={styles.titleContainer}>
          <Text 
            variant="headlineSmall" 
            style={[styles.title, {color: theme.colors.onSurface}]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text 
              variant="bodySmall" 
              style={[styles.subtitle, {color: theme.colors.onSurfaceVariant}]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.rightContainer}>
        {rightIcons.map((icon, index) => (
          <TouchableOpacity
            key={index}
            onPress={icon.onPress}
            style={styles.iconButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon 
              name={icon.name} 
              size={24} 
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftIcon: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default AppHeader;