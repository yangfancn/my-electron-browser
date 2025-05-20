import { ElectronAPI } from "@electron-toolkit/preload"
import { DownloadProgressData, DownloadState } from "./types/download"

declare global {
  interface Window {
    electron: ElectronAPI
    downloadApi: {
      onProgress: (callback: (data: DownloadProgressData) => void) => void
      onDone: (callback: (id: string, state: DownloadState) => void) => void
      onRemoved: (callback: (id: string) => void) => void
      pause: (id: string) => void
      resume: (id: string) => void
      cancel: (id: string) => void
      remove: (id: string) => void
    }
  }
}
