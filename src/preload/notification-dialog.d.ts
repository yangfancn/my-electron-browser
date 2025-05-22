import { ElectronAPI } from "@electron-toolkit/preload"

declare global {
  interface Window {
    electron: ElectronAPI
    notificationDialogApi: {
      close: () => void
      onInitData: (
        callback: (data: { title: string; content: string; timeout: number }) => void
      ) => void
      readyToShow: (size: { width: number; height: number }) => void
    }
  }
}
