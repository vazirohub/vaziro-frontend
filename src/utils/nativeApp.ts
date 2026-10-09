import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Check if running inside native Android or iOS Capacitor wrapper
 */
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Get current platform: 'android' | 'ios' | 'web'
 */
export const getPlatform = (): 'android' | 'ios' | 'web' => {
  return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
};

/**
 * Initialize native device integrations on app startup
 */
export const initNativeApp = (navigate: (to: any) => void) => {
  if (!isNativeApp()) return;

  // 1. Status Bar Setup
  try {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#ffffff' });
    StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.debug('[NativeApp] StatusBar init:', err);
  }

  // 2. Hide Splash Screen smoothly after initial load
  try {
    setTimeout(() => {
      SplashScreen.hide({ fadeOutDuration: 300 });
    }, 800);
  } catch (err) {
    console.debug('[NativeApp] SplashScreen hide:', err);
  }

  // 3. Android Hardware Back Button Navigation
  try {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      // Check for open modals or drawers
      const hasOpenModal = document.querySelector('[role="dialog"], .fixed.inset-0, .z-50');
      if (hasOpenModal) {
        // Trigger Escape key to close open dialog
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        return;
      }

      const currentPath = window.location.pathname;
      const isRoot = currentPath === '/' || currentPath === '';

      if (isRoot) {
        // Minimize app if at root
        CapApp.minimizeApp();
      } else if (canGoBack || window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    });
  } catch (err) {
    console.debug('[NativeApp] BackButton setup:', err);
  }

  // 4. Handle Deep Links (vaziro:// and https://vaziro.in)
  try {
    CapApp.addListener('appUrlOpen', (data) => {
      console.log('[NativeApp] Deep link received:', data.url);
      try {
        const urlObj = new URL(data.url);
        const path = urlObj.pathname + urlObj.search + urlObj.hash;
        if (path) {
          navigate(path);
        }
      } catch {
        const routeMatch = data.url.replace(/^vaziro:\/\//i, '/');
        if (routeMatch) {
          navigate(routeMatch);
        }
      }
    });
  } catch (err) {
    console.debug('[NativeApp] Deep link setup:', err);
  }
};
