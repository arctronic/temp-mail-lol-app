import { useState } from 'react';
import { SnackbarAction } from '../components/ui/CustomSnackbar';

export interface SnackbarState {
  visible: boolean;
  message: string;
  action?: SnackbarAction;
  type?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: '',
  });

  const showSnackbar = (
    message: string,
    options?: {
      action?: SnackbarAction;
      type?: 'default' | 'success' | 'error' | 'warning';
      duration?: number;
    }
  ) => {
    setSnackbar({
      visible: true,
      message,
      action: options?.action,
      type: options?.type || 'default',
      duration: options?.duration || 3000,
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  };

  const showSuccess = (message: string, action?: SnackbarAction) => {
    showSnackbar(message, { type: 'success', action });
  };

  const showError = (message: string, action?: SnackbarAction) => {
    showSnackbar(message, { type: 'error', action });
  };

  const showWarning = (message: string, action?: SnackbarAction) => {
    showSnackbar(message, { type: 'warning', action });
  };

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
  };
} 