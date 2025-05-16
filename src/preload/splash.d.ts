import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  onCloseSplash: (callback: () => void) => void
  closeSplash: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
