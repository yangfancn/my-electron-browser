import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"
import { TabTitleData, TabFaviconData, PresetCookies } from "./types"
// Custom APIs for renderer
const api = {
  closeSplash: (): void => ipcRenderer.send("index:close-splash"),
  createTab: (id: string, url: string, presetCookies: PresetCookies): void => {
    ipcRenderer.send("tab-create", { id, url, presetCookies })
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
  },
  onTabCloseRequested: (callback: (id) => void): void => {
    ipcRenderer.on("tab-close-requested", (_event, id: string) => {
      callback(id)
    })
  },
  onSwitchNextTab: (callback: () => void): void => {
    ipcRenderer.on("switch-next-tab", (): void => callback())
  },
  onSwitchPrevTab: (callback: () => void): void => {
    ipcRenderer.on("switch-prev-tab", (): void => callback())
  },
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  unmaximize: () => ipcRenderer.send("window-unmaximize"),
  close: () => ipcRenderer.send("window-close"),
  isMaximized: (callback) => {
    ipcRenderer.on("window-is-maximized", (_event, isMax) => callback(isMax))
  },
  requestIsMaximized: () => ipcRenderer.send("request-is-maximized"),
  onNavigationStateUpdated: (
    callback: (data: { id: string; canGoBack: boolean; canGoForward: boolean }) => void
  ) => ipcRenderer.on("navigation-state-updated", (_event, data) => callback(data)),
  onTabLoadingState: (callback: (data: { id: string; loading: boolean }) => void) =>
    ipcRenderer.on("tab-loading-state", (_event, data) => callback(data)),
  onNavigationFailed: (callback: (data: { errorCode: number; errorDescription: string }) => void) =>
    ipcRenderer.on("navigation-failed-state", (_event, data) => callback(data)),
  onNewTabRequested: (callback: (url: string) => void) =>
    ipcRenderer.on("new-tab-requested", (_event, url) => callback(url)),
  activeTabGoBack: () => ipcRenderer.send("active-tab-go-back"),
  activeTabGoForward: () => ipcRenderer.send("active-tab-go-forward"),
  activeTabReload: () => ipcRenderer.send("active-tab-reload"),
  activeTabStop: () => ipcRenderer.send("active-tab-stop"),
  toggleLeftDrawer: () => ipcRenderer.invoke("toggle-left-drawer"),
  toggleDownloadWindow: () => ipcRenderer.send("toggle-download")
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
