import { BrowserWindow, WebContentsView } from "electron"

interface Tab {
  id: string
  url: string
  view: WebContentsView
}

const tabs: Tab[] = []
let activeTabId: string | null = null
let mainWindow: BrowserWindow

function setBoundsFill(view: WebContentsView): void {
  view.setBounds({
    x: 0,
    y: 40,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height - 40
  })
}

// @todo new setBoundsAnimation()

function sendNavigationState(id: string, view: WebContentsView): void {
  const history = view.webContents.navigationHistory

  const state = {
    id,
    canGoBack: history.canGoBack(),
    canGoForward: history.canGoForward()
  }

  mainWindow.webContents.send("navigation-state-updated", state)
}

export function initTabManager(win: BrowserWindow): void {
  mainWindow = win

  mainWindow.on("resize", () => {
    const activeTab = tabs.find((t) => t.id === activeTabId)
    if (activeTab) {
      setBoundsFill(activeTab.view)
    }
  })
}

export function createTab(id: string, url: string): void {
  const view = new WebContentsView()
  view.webContents.loadURL(url)
  mainWindow.contentView?.addChildView(view)
  view.webContents.openDevTools()
  setBoundsFill(view)
  view.setVisible(false)

  tabs.push({ id, url, view })

  //events
  //title updated
  view.webContents.on("page-title-updated", (_, title) => {
    mainWindow.webContents.send("page-title-updated", { id, title })
  })
  //favicon updated
  view.webContents.on("page-favicon-updated", (_, favicons) => {
    const firstFavicon = favicons[0] ?? null
    if (firstFavicon) {
      mainWindow.webContents.send("page-favicon-updated", { id, favicon: firstFavicon })
    }
  })
  //history
  view.webContents.on("did-navigate", () => sendNavigationState(id, view))
  view.webContents.on("did-navigate-in-page", () => sendNavigationState(id, view))
  view.webContents.on("did-frame-navigate", () => sendNavigationState(id, view))
  //loading
  view.webContents.on("did-start-loading", () => {
    mainWindow.webContents.send("tab-loading-state", { id, loading: true })
  })
  view.webContents.on("did-stop-loading", () => {
    mainWindow.webContents.send("tab-loading-state", { id, loading: false })
  })
  //block and proxy new window events
  view.webContents.setWindowOpenHandler(({ url }) => {
    mainWindow.webContents.send("new-tab-requested", url)
    return { action: "deny" }
  })
  //failed
  view.webContents.on("did-fail-load", (_, errorCode) => {
    console.log(errorCode)
  })
}

export function switchTab(id: string): void {
  const tab = tabs.find((t) => t.id === id)
  if (!tab) return

  tabs.forEach((t) => t.view.setBounds({ x: 0, y: 40, width: 0, height: 0 }))
  setBoundsFill(tab.view)
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

// page actions
export function activeTabGoBack(): void {
  const activeTab = tabs.find((t) => t.id === activeTabId)
  if (activeTab) {
    activeTab.view.webContents.navigationHistory.goBack()
  }
}

export function activeTabGoForward(): void {
  const activeTab = tabs.find((t) => t.id === activeTabId)
  if (activeTab) {
    activeTab.view.webContents.navigationHistory.goForward()
  }
}

export function activeTabReload(): void {
  const activeTab = tabs.find((t) => t.id === activeTabId)
  console.log(activeTab)
  if (activeTab) {
    activeTab.view.webContents.reload()
  }
}

export function activeTabStop(): void {
  const activeTab = tabs.find((t) => t.id === activeTabId)
  if (activeTab) {
    activeTab.view.webContents.stop()
  }
}
