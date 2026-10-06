import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proanta.vaziro',
  appName: 'Vaziro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
