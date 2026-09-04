export const MSG91_WIDGET_ID = '366964695657393438383035';
export const MSG91_TOKEN_AUTH = '567588TYvUCtrkERZ6a9a9c96P1';

declare global {
  interface Window {
    configuration?: any;
    initSendOTP?: (config: any) => void;
    sendOtp?: (
      identifier: string,
      success?: (data: any) => void,
      failure?: (error: any) => void
    ) => void;
    retryOtp?: (
      channel: string | null,
      success?: (data: any) => void,
      failure?: (error: any) => void,
      widgetId?: string
    ) => void;
    verifyOtp?: (
      otp: string | number,
      success?: (data: any) => void,
      failure?: (error: any) => void,
      widgetId?: string
    ) => void;
    getWidgetData?: () => any;
    isCaptchaVerified?: () => boolean;
    __lastMsg91Token?: any;
  }
}

/**
 * Initializes and ensures the MSG91 OTP Provider script is loaded and ready
 */
export const initMsg91Sdk = (identifier?: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);

    // Set configuration object on window
    window.configuration = {
      widgetId: MSG91_WIDGET_ID,
      tokenAuth: MSG91_TOKEN_AUTH,
      identifier: identifier || '',
      exposeMethods: true,
      captchaRenderId: '',
      success: (data: any) => {
        if (import.meta.env.DEV) {
          console.log('[MSG91] Global verification success:', data);
        }
        window.__lastMsg91Token = typeof data === 'string' ? data : (data?.token || data?.['access-token'] || data?.message || data);
        window.dispatchEvent(new CustomEvent('msg91:success', { detail: data }));
      },
      failure: (error: any) => {
        if (import.meta.env.DEV) {
          console.warn('[MSG91] Global error:', error);
        }
        window.dispatchEvent(new CustomEvent('msg91:failure', { detail: error }));
      },
    };

    // If script and methods are already loaded, re-init with config
    if (typeof window.sendOtp === 'function') {
      if (typeof window.initSendOTP === 'function') {
        try {
          window.initSendOTP(window.configuration);
        } catch (e) {
          console.warn('[MSG91] Re-init warning:', e);
        }
      }
      return resolve(true);
    }

    // Check if script tag is already in DOM
    const existingScript = document.querySelector('script[src*="otp-provider.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (typeof window.initSendOTP === 'function') {
          window.initSendOTP(window.configuration);
        }
        resolve(true);
      });
      return;
    }

    // Dynamically insert script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://verify.msg91.com/otp-provider.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.initSendOTP === 'function') {
        window.initSendOTP(window.configuration);
      }
      resolve(true);
    };
    script.onerror = (err) => {
      console.warn('[MSG91] Failed to load MSG91 SDK script:', err);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Format phone or email into MSG91 identifier format
 * For Indian mobile numbers, MSG91 requires 91XXXXXXXXXX (without leading +)
 */
export const formatMsg91Identifier = (input: string): string => {
  const clean = input.trim();
  if (clean.includes('@')) {
    return clean.toLowerCase();
  }

  const digits = clean.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return clean;
};

/**
 * Send OTP to phone number or email using MSG91 Web SDK
 */
export const sendMsg91Otp = async (identifier: string): Promise<any> => {
  await initMsg91Sdk(identifier);

  const formattedId = formatMsg91Identifier(identifier);

  return new Promise((resolve, reject) => {
    if (typeof window.sendOtp !== 'function') {
      return reject(new Error('MSG91 SDK is not initialized. Please try again.'));
    }

    window.sendOtp(
      formattedId,
      (data: any) => {
        resolve(data);
      },
      (error: any) => {
        const errorMsg =
          typeof error === 'string'
            ? error
            : error?.message || error?.description || 'Failed to dispatch OTP. Please check the number.';
        reject(new Error(errorMsg));
      }
    );
  });
};

/**
 * Verify OTP entered by user using MSG91 Web SDK
 */
export const verifyMsg91Otp = async (otp: string | number): Promise<any> => {
  await initMsg91Sdk();

  const cleanOtp = typeof otp === 'string' ? otp.trim() : String(otp).trim();

  return new Promise((resolve, reject) => {
    if (typeof window.verifyOtp !== 'function') {
      if (window.__lastMsg91Token) {
        return resolve(window.__lastMsg91Token);
      }
      return reject(new Error('MSG91 SDK is not initialized. Please try again.'));
    }

    let settled = false;
    let timer: any = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('msg91:success', onGlobalSuccess);
      window.removeEventListener('msg91:failure', onGlobalFailure);
    };

    const onGlobalSuccess = (e: any) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(e.detail || window.__lastMsg91Token || true);
    };

    const onGlobalFailure = (e: any) => {
      if (settled) return;
      settled = true;
      cleanup();
      const errorMsg =
        e.detail?.message || e.detail?.description || 'The OTP is incorrect. Please check and try again.';
      reject(new Error(errorMsg));
    };

    window.addEventListener('msg91:success', onGlobalSuccess, { once: true });
    window.addEventListener('msg91:failure', onGlobalFailure, { once: true });

    // Safety timeout after 10s
    timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(new Error('OTP verification timed out. Please try again.'));
      }
    }, 10000);

    // CRITICAL: Call window.verifyOtp with ONLY cleanOtp, successCallback, errorCallback.
    // In otp-provider.js, the 4th parameter `s` is the reqId. Passing widgetId overwrote the reqId
    // and caused MSG91 to reject the OTP on every attempt.
    try {
      window.verifyOtp(
        cleanOtp,
        (data: any) => {
          if (settled) return;
          settled = true;
          cleanup();
          window.__lastMsg91Token = data;
          resolve(data || true);
        },
        (error: any) => {
          if (settled) return;
          settled = true;
          cleanup();
          const errorMsg =
            typeof error === 'string'
              ? error
              : error?.message || error?.description || 'The OTP is incorrect. Please check and try again.';
          reject(new Error(errorMsg));
        }
      );
    } catch (err: any) {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    }
  });
};

/**
 * Resend OTP via SMS / retry channel
 */
export const retryMsg91Otp = async (channel?: string | null): Promise<any> => {
  await initMsg91Sdk();

  return new Promise((resolve, reject) => {
    if (typeof window.retryOtp !== 'function') {
      return reject(new Error('MSG91 SDK is not ready. Please try again.'));
    }

    // Do NOT pass MSG91_WIDGET_ID as 4th argument
    window.retryOtp(
      channel || null,
      (data: any) => {
        resolve(data);
      },
      (error: any) => {
        const errorMsg =
          typeof error === 'string'
            ? error
            : error?.message || error?.description || 'Failed to resend OTP. Please wait before retrying.';
        reject(new Error(errorMsg));
      }
    );
  });
};

/**
 * Get MSG91 Widget Data
 */
export const getMsg91WidgetData = (): any => {
  if (typeof window !== 'undefined' && typeof window.getWidgetData === 'function') {
    try {
      return window.getWidgetData();
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Check if MSG91 captcha is verified
 */
export const isMsg91CaptchaVerified = (): boolean => {
  if (typeof window !== 'undefined' && typeof window.isCaptchaVerified === 'function') {
    try {
      return window.isCaptchaVerified();
    } catch {
      return true;
    }
  }
  return true;
};
