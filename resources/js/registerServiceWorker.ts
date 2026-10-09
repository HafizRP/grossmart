/**
 * PWA Service Worker Registration & Install Prompt Handler
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const installListeners: Array<(canInstall: boolean) => void> = [];

export function initPWA(): void {
  if (typeof window === 'undefined') return;

  // Tangkap event instalasi browser (PWA install prompt)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    installListeners.forEach((listener) => listener(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installListeners.forEach((listener) => listener(false));
  });

  // Registrasi Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  // Ada update baru tersedia
                }
              });
            }
          });
        })
        .catch(() => {});
    });
  }
}

export function subscribeInstallPrompt(callback: (canInstall: boolean) => void): () => void {
  installListeners.push(callback);
  callback(deferredInstallPrompt !== null);

  return () => {
    const idx = installListeners.indexOf(callback);
    if (idx !== -1) {
      installListeners.splice(idx, 1);
    }
  };
}

export async function promptPWAInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) return false;

  await deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installListeners.forEach((listener) => listener(false));
  return choice.outcome === 'accepted';
}
