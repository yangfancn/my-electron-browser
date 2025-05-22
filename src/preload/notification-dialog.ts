import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"

// Custom APIs for renderer
const notificationDialogApi = {
  hide: () => ipcRenderer.send("notification:hide"),
  show: () => ipcRenderer.send("notification:show")
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI)
    contextBridge.exposeInMainWorld("notificationDialogApi", notificationDialogApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.notificationDialogApi = notificationDialogApi
}
