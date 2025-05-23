import { contextBridge, ipcRenderer, shell } from "electron"
import { electronAPI } from "@electron-toolkit/preload"
import { DownloadProgressData, DownloadState } from "./types/download"
import { existsSync } from "fs"

// Custom APIs for renderer
const downloadApi = {
  showDownload: () => ipcRenderer.send("show-download"),
  hideDownload: () => ipcRenderer.send("hide-download"),
  onProgress: (callback: (data: DownloadProgressData) => void) => {
    ipcRenderer.on("download-progress", (_, data) => callback(data))
  },
  onDone: (callback: (id: string, state: DownloadState) => void) => {
    ipcRenderer.on("download-done", (_, { id, state }) => callback(id, state))
  },
  onRemoved: (callback: (id: string) => void) => {
    ipcRenderer.on("download-removed", (_, { id }) => callback(id))
  },
  pause: (id: string) => ipcRenderer.send("download-pause", id),
  resume: (id: string) => ipcRenderer.send("download-resume", id),
  cancel: (id: string) => ipcRenderer.send("download-cancel", id),
  remove: (id: string) => ipcRenderer.send("download-remove", id),
  exists: (filepath: string) => existsSync(filepath),
  open: (filepath: string) => shell.openPath(filepath),
  showInFolder: (filepath: string) => shell.showItemInFolder(filepath)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI)
    contextBridge.exposeInMainWorld("downloadApi", downloadApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.downloadApi = downloadApi
}
