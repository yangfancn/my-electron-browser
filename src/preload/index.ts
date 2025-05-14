import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"

// Custom APIs for renderer
const api = {
  createTab: (id: string, url: string): void => {
    ipcRenderer.send("tab-create", { id, url })
  },
  switchTab: (id: string): void => {
    ipcRenderer.send("tab-switch", id)
  },
  closeTab: (id: string): void => {
    ipcRenderer.send("tab-close", id)
  },
  onPageTitleUpdated: (callback: (data: TabTitleData) => void): void => {
    ipcRenderer.on("page-title-updated", (_, data: TabTitleData) => callback(data))
  },
  onPageFaviconUpdated: (callback: (data: TabFaviconData) => void): void => {
    ipcRenderer.on("page-favicon-updated", (_, data: TabFaviconData) => callback(data))
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI)
    contextBridge.exposeInMainWorld("api", api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
