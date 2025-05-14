import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      createTab: (id: number, url: string) => void
      switchTab: (id: number) => void
      closeTab: (id: number) => void
    }
  }
}
