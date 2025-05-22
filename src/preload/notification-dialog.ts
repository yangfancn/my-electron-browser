import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"

// Custom APIs for renderer
const notificationDialogApi = {
  close: () => ipcRenderer.send("notification:close"),
  onInitData: (callback: (data: { title: string; content: string; timeout: number }) => void) =>
    ipcRenderer.once("init-data", (_, data) => callback(data)),
  readyToShow: (size: { width: number; height: number }) =>
    ipcRenderer.send("notification:ready-to-show", size)
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
