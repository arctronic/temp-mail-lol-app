import React, {useState} from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {IconButton, Snackbar, useTheme} from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';

interface CopyButtonProps {
  text: string;
  size?: number;
  iconColor?: string;
  successMessage?: string;
  style?: any;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  size = 24,
  iconColor,
  successMessage = 'Copied to clipboard',
  style,
}) => {
  const theme = useTheme();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setString(text);
      setShowSnackbar(true);
    } catch (error) {
      console.error('Copy to clipboard error:', error);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handleCopy} style={[styles.button, style]}>
        <IconButton
          icon="content-copy"
          size={size}
          iconColor={iconColor || theme.colors.primary}
          style={styles.iconButton}
        />
      </TouchableOpacity>
      
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
        style={styles.snackbar}>
        {successMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
  },
  iconButton: {
    margin: 0,
  },
  snackbar: {
    marginBottom: 80, // Above bottom navigation
  },
});

export default CopyButton;

