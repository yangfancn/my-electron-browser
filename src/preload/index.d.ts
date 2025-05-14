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
  createTab: (id: string, url: string) => void
  switchTab: (id: string) => void
  closeTab: (id: string) => void
  onPageTitleUpdated: (callback: (data: TabTitleData) => void) => void
  onPageFaviconUpdated: (callback: (data: TabFaviconData) => void) => void
  // 可以继续添加其他API方法的类型
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
