import { ElectronAPI } from "@electron-toolkit/preload"
import { TabTitleData, TabFaviconData, PresetCookies } from "./types";

interface Api {
  closeSplash: () => void
  createTab: (id: string, url: string, presetCookies: PresetCookies) => void
  switchTab: (id: string) => void
  closeTab: (id: string) => void
  onPageTitleUpdated: (callback: (data: TabTitleData) => void) => void
  onPageFaviconUpdated: (callback: (data: TabFaviconData) => void) => void
  onTabCloseRequested: (callback: (id: string) => void) => void
  onActiveTabIdUpdated: (callback: (id: string) => void) => void
  onSwitchNextTab: (callback: () => void) => void
  onSwitchPrevTab: (callback: () => void) => void
  minimize: () => void
  maximize: () => void
  unmaximize: () => void
  close: () => void
  isMaximized: (callback: (isMaximized: boolean) => void) => void
  requestIsMaximized: () => void
  onNavigationStateUpdated: (
    callback: (data: { id: string; canGoBack: boolean; canGoForward: boolean }) => void
  ) => void
  onTabLoadingState: (callback: (data: { id: string; loading: boolean }) => void) => void
  onNavigationFailed: (callback: (data: { errorCode: number, errorDescription: string  }) => void) => void
  onNewTabRequested: (callback: (url: string) => void) => void
  activeTabGoBack: () => void
  activeTabGoForward: () => void
  activeTabReload: () => void
  activeTabStop: () => void
  toggleLeftDrawer: () => Promise<boolean>
  toggleDownloadWindow: () => void
  showNotificationDialog: (data: { title: string; content: string; timeout: number }) => void
  closeNotificationDialog: () => void
}

interface Env {
  API_DOMAIN: string
  API_GET_CONFIG_PATH: string
  REVERB_APP_KEY: string
  REVERB_HOST: string
  REVERB_WS_PORT: number
  REVERB_WSS_PORT: number
  CHANNEL: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
    env: Env
  }
}
