export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  keyId: string;
  orderId: string;
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
}

/**
 * Ensures Razorpay Checkout script is loaded
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Opens Razorpay Checkout Modal and returns a Promise
 */
export const openRazorpayCheckout = async (
  options: RazorpayOptions
): Promise<RazorpayPaymentSuccessResponse> => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Could not load Razorpay Payment SDK. Please check your connection.');
  }

  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: options.keyId,
      amount: options.amount,
      currency: options.currency || 'INR',
      name: options.name || 'Vaziro™',
      description: options.description || 'Secure Service Payment',
      image: '/logo-icon.png',
      order_id: options.orderId,
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
      },
      notes: options.notes || {},
      theme: {
        color: '#059669', // Vaziro Emerald Green
      },
      handler: function (response: RazorpayPaymentSuccessResponse) {
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment was cancelled by the user.'));
        },
      },
    };

    const rzp = new (window as any).Razorpay(razorpayOptions);
    rzp.on('payment.failed', function (resp: any) {
      reject(new Error(resp.error?.description || 'Payment failed. Please try again.'));
    });
    rzp.open();
  });
};
