import { app, globalShortcut } from "electron"
import {
  activeTabReload,
  activeTabForceReload,
  activeTabGoBack,
  activeTabGoForward,
  activeTabStop,
  activeTabToggleDevTools,
  switchPrevTab,
  switchNextTab
} from "./tabManager"

export function registerBrowserShortcuts(): void {
  app.whenReady().then(() => {
    // Navigation shortcuts
    globalShortcut.register("CommandOrControl+R", activeTabForceReload)
    globalShortcut.register("F5", activeTabReload)
    globalShortcut.register("Escape", activeTabStop)
    globalShortcut.register("Alt+Left", activeTabGoBack)
    globalShortcut.register("Alt+Right", activeTabGoForward)
    globalShortcut.register("CommandOrControl+Shift+I", activeTabToggleDevTools)
    globalShortcut.register("Alt+Command+I", activeTabToggleDevTools) // Mac fallback

    // Tab shortcuts
    globalShortcut.register("Control+Tab", switchNextTab)
    globalShortcut.register("Control+Shift+Tab", switchPrevTab)
  })
}

// 在 app 退出前清除快捷键
export function unregisterBrowserShortcuts(): void {
  globalShortcut.unregisterAll()
}
