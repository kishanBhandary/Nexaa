import { useState, useEffect } from 'react';

const MobileDetector = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroidDevice = /Android/.test(userAgent);
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(isMobileDevice);
      setIsIOS(isIOSDevice);
      setIsAndroid(isAndroidDevice);
      setIsTouchDevice(hasTouchScreen);
    };

    const handleResize = () => {
      detectDevice();
    };

    detectDevice();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return children({ isMobile, isIOS, isAndroid, isTouchDevice });
};

// Custom hook for mobile detection
export const useMobileDetector = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isTouchDevice: false,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setDeviceInfo({
        isMobile,
        isIOS,
        isAndroid,
        isTouchDevice,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

// Utility functions for mobile-specific behavior
export const mobileUtils = {
  // Prevent iOS zoom on input focus
  preventIOSZoom: () => {
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        );
      }
    }
  },

  // Enable iOS zoom after input blur
  enableIOSZoom: () => {
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1'
        );
      }
    }
  },

  // Check if device is in landscape mode
  isLandscape: () => {
    return window.innerWidth > window.innerHeight;
  },

  // Get safe area insets for notched devices
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('--safe-area-inset-top') || '0px',
      bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
      left: style.getPropertyValue('--safe-area-inset-left') || '0px',
      right: style.getPropertyValue('--safe-area-inset-right') || '0px',
    };
  },

  // Smooth scroll with mobile optimization
  smoothScroll: (element, options = {}) => {
    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    };
    
    element.scrollIntoView(defaultOptions);
  },

  // Handle mobile keyboard appearance
  handleMobileKeyboard: {
    onShow: (callback) => {
      const initialHeight = window.innerHeight;
      const checkHeight = () => {
        const currentHeight = window.innerHeight;
        if (currentHeight < initialHeight * 0.75) {
          callback('show');
        } else {
          callback('hide');
        }
      };
      
      window.addEventListener('resize', checkHeight);
      return () => window.removeEventListener('resize', checkHeight);
    }
  },

  // Vibration for mobile feedback (if supported)
  vibrate: (pattern = 100) => {
    if (navigator.vibrate && 'ontouchstart' in window) {
      navigator.vibrate(pattern);
    }
  },

  // Check if device has notch (iPhone X+)
  hasNotch: () => {
    const style = getComputedStyle(document.documentElement);
    const safeAreaTop = style.getPropertyValue('--safe-area-inset-top');
    return safeAreaTop && safeAreaTop !== '0px';
  },

  // Get device pixel ratio
  getPixelRatio: () => {
    return window.devicePixelRatio || 1;
  },
};

export default MobileDetector;