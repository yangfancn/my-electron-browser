import { ElectronAPI } from "@electron-toolkit/preload"
import { TabTitleData, TabFaviconData } from "./types"

interface Api {
  closeSplash: () => void
  createTab: (id: string, url: string) => void
  switchTab: (id: string) => void
  closeTab: (id: string) => void
  onPageTitleUpdated: (callback: (data: TabTitleData) => void) => void
  onPageFaviconUpdated: (callback: (data: TabFaviconData) => void) => void
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
  onNewTabRequested: (callback: (url: string) => void) => void
  activeTabGoBack: () => void
  activeTabGoForward: () => void
  activeTabReload: () => void
  activeTabStop: () => void
  toggleLeftDrawer: () => Promise<boolean>
  // 可以继续添加其他API方法的类型
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
