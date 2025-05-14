import { BrowserWindow, WebContentsView } from "electron"

interface Tab {
  id: string
  url: string
  view: WebContentsView
}

const tabs: Tab[] = []
let activeTabId: string | null = null
let mainWindow: BrowserWindow

export function initTabManager(win: BrowserWindow): void {
  mainWindow = win
}

export function createTab(id: string, url: string): void {
  const view = new WebContentsView()
  view.webContents.loadURL(url)
  mainWindow.contentView?.addChildView(view)
  view.setBounds({
    x: 0,
    y: 40,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height - 40
  })
  view.setVisible(false)

  tabs.push({ id, url, view })
}

export function switchTab(id: string): void {
  const tab = tabs.find((t) => t.id === id)
  if (!tab) return

  tabs.forEach((t) => t.view.setBounds({ x: 0, y: 40, width: 0, height: 0 }))
  tab.view.setBounds({
    x: 0,
    y: 40,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height - 40
  })
  tab.view.setVisible(true)
  activeTabId = id
}

export function closeTab(id: string): void {
  const index = tabs.findIndex((t) => t.id === id)
  if (index === -1) return

  const tab = tabs[index]
  mainWindow.contentView?.removeChildView(tab.view)
  tabs.splice(index, 1)

  if (activeTabId === id) {
    const fallback = tabs.at(-1)
    if (fallback) switchTab(fallback.id)
    else activeTabId = null
  }
}
