import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ErrorStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
  style?: any;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  actionLabel = 'Try Again',
  onAction,
  icon = 'error-outline',
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Icon
        name={icon}
        size={64}
        color={theme.colors.error}
        style={styles.icon}
      />
      <Text
        variant="headlineSmall"
        style={[styles.title, {color: theme.colors.onSurface}]}>
        {title}
      </Text>
      <Text
        variant="bodyLarge"
        style={[styles.message, {color: theme.colors.onSurfaceVariant}]}>
        {message}
      </Text>
      {onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={theme.colors.error}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});

export default ErrorState;

