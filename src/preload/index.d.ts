import { ElectronAPI } from '@electron-toolkit/preload'

interface TabTitleData {
  id: string
  title: string
}

interface TabFaviconData {
  id: string
  favicon: string
}

interface Api {
  setVisible: () => void
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
  onTabLoadingState: (
    callback: (data: { id: string; loading: boolean }) => void
  ) => void
  onNewTabRequested: (callback: (url: string) => void) => void
  // 可以继续添加其他API方法的类型
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
