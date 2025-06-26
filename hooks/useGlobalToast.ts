import { useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export function useGlobalToast() {
  const { 
    showSuccessToast, 
    showErrorToast, 
    showInfoToast, 
    showWarningToast, 
    showToast,
    clearAllToasts 
  } = useNotification();

  const showSuccess = useCallback((message: string, duration?: number) => {
    return showSuccessToast(message, duration);
  }, [showSuccessToast]);

  const showError = useCallback((message: string, duration?: number) => {
    return showErrorToast(message, duration);
  }, [showErrorToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    return showInfoToast(message, duration);
  }, [showInfoToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    return showWarningToast(message, duration);
  }, [showWarningToast]);

  const show = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration?: number,
    action?: { label: string; onPress: () => void }
  ) => {
    return showToast(message, type, duration, action);
  }, [showToast]);

  const clear = useCallback(() => {
    clearAllToasts();
  }, [clearAllToasts]);

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    show,
    clear,
  };
} 