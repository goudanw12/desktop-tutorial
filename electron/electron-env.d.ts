/// <reference types="vite-plugin-electron/electron-env" />

interface Window {
  electronAPI: {
    selectImage: () => Promise<string[]>;
    getAppVersion: () => Promise<string>;
    getUserDataPath: () => Promise<string>;
    isElectron: boolean;
  };
}
