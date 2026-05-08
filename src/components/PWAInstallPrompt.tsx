import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 检测 iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 检测是否已经安装
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    if (isStandalone) return;

    // Android 安装提示
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS 显示手动安装提示
    if (isIOSDevice && !isStandalone) {
      const dismissed = localStorage.getItem('pwa-ios-dismissed');
      if (!dismissed) {
        setTimeout(() => setIsVisible(true), 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (isIOS) {
      localStorage.setItem('pwa-ios-dismissed', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-50 animate-slideUp">
      <div className="bg-primary-500 text-white rounded-2xl p-4 shadow-lg shadow-primary-500/30 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">安装到主屏幕</p>
          <p className="text-xs text-white/80 truncate">
            {isIOS 
              ? '点击分享按钮，然后选择"添加到主屏幕"' 
              : '像原生App一样使用，支持离线访问'}
          </p>
        </div>

        {!isIOS && (
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-primary-600 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            安装
          </button>
        )}
        
        <button
          onClick={handleDismiss}
          className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
