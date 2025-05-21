import { BrowserWindow, WebContentsView, screen } from "electron"
import { PresetCookies } from "../preload/types"
import {
  TITLE_BAR_HEIGHT,
  LEFT_DRAWER_CLOSED_WIDTH,
  LEFT_DRAWER_OPENED_WIDTH,
  LEFT_DRAWER_TOGGLE_DURATION
} from "../common/const"

interface Tab {
  id: string
  url: string
  view: WebContentsView
}

const tabs: Tab[] = []
let activeTabId: string | null = null
let leftDrawerOpen: boolean = false
let mainWindow: BrowserWindow

export function getLeftDrawerWidth(): number {
  return leftDrawerOpen ? LEFT_DRAWER_OPENED_WIDTH : LEFT_DRAWER_CLOSED_WIDTH
}

function setBoundsFill(view: WebContentsView): void {
  const leftDrawerWidth = getLeftDrawerWidth()
  view.setBounds({
    x: leftDrawerWidth,
    y: TITLE_BAR_HEIGHT,
    width: mainWindow.getBounds().width - leftDrawerWidth,
    height: mainWindow.getBounds().height - TITLE_BAR_HEIGHT
  })
}

export function toggleLeftDrawer(): boolean {
  const activeTab = tabs.find((t) => t.id === activeTabId)
  if (!activeTab) return leftDrawerOpen

  const mainWinBounds = mainWindow.getBounds()
  const view = activeTab.view
  const startBounds = view.getBounds()
  const startTime = performance.now()
  const targetState = !leftDrawerOpen

  const targetX = targetState ? LEFT_DRAWER_OPENED_WIDTH : LEFT_DRAWER_CLOSED_WIDTH
  const targetWidth = mainWinBounds.width - targetX

  // 匀速线性：progress 本身
  const display = screen.getDisplayNearestPoint(startBounds)
  const frameInterval = 1000 / (display?.displayFrequency || 60)

  const duration = LEFT_DRAWER_TOGGLE_DURATION
  let lastFrameTime = 0

  const animate = (): void => {
    const now = performance.now()
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)

    view.setBounds({
      x: Math.round(startBounds.x + (targetX - startBounds.x) * progress),
      y: TITLE_BAR_HEIGHT,
      width: Math.round(startBounds.width + (targetWidth - startBounds.width) * progress),
      height: mainWinBounds.height - TITLE_BAR_HEIGHT
    })

    if (progress < 1) {
      const nextFrameTime = lastFrameTime + frameInterval
      const delay = Math.max(0, nextFrameTime - performance.now())
      setTimeout(animate, delay)
      lastFrameTime = now
    } else {
      leftDrawerOpen = targetState
    }
  }

  animate()
  return targetState
}

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

export function createTab(id: string, url: string, presetCookies: PresetCookies = []): void {
  const view = new WebContentsView()
  const cookieSetPromises = presetCookies.map((cookie) => {
    return view.webContents.session.cookies.set({
      url,
      path: "/",
      name: cookie.name,
      value: cookie.value
    })
  })

  Promise.all(cookieSetPromises)
    .catch((error) => {
      console.error("Error setting cookies:", error)
    })
    .finally(() => view.webContents.loadURL(url))

  mainWindow.contentView?.addChildView(view)
  if (url.startsWith("js-browser")) view.webContents.openDevTools()
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
    mainWindow.webContents.send("navigation-failed-state", { errorCode: 0 })
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
  view.webContents.on(
    "did-fail-load",
    (_, errorCode: number, errorDescription: string, _validatedURL, isMainFrame) => {
      if (isMainFrame) {
        view.setVisible(false)
        mainWindow.webContents.send("navigation-failed-state", { errorCode, errorDescription })
      }
    }
  )
  view.webContents.on(
    "did-fail-provisional-load",
    (_, errorCode: number, errorDescription: string) => {
      view.setVisible(false)
      mainWindow.webContents.send("navigation-failed-state", { errorCode, errorDescription })
    }
  )

  view.webContents.on("will-navigate", () => {
    if (!view.getVisible()) {
      view.setVisible(true)
    }
  })

  view.webContents.session.on("will-download", (_, item) => {
    if (!view.webContents.getURL() && item.getURL()) {
      item.once("updated", () => {
        mainWindow.webContents.send("tab-close-requested", id)
      })
    }
  })
}

export function switchTab(id: string): void {
  const tab = tabs.find((t) => t.id === id)
  if (!tab) return

  tabs.forEach((t) =>
    t.view.setBounds({ x: getLeftDrawerWidth(), y: TITLE_BAR_HEIGHT, width: 0, height: 0 })
  )

  if (!tab.view.getVisible()) {
    tab.view.setVisible(true)
  }

  setBoundsFill(tab.view)

  tab.view.webContents.openDevTools({ mode: "right" })

  activeTabId = id
}

export function getActiveTab(): Tab | undefined {
  return tabs.find((t) => t.id === activeTabId)
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
  getActiveTab()?.view.webContents.navigationHistory.goBack()
}

export function activeTabGoForward(): void {
  getActiveTab()?.view.webContents.navigationHistory.goForward()
}

export function activeTabReload(): void {
  getActiveTab()?.view.webContents.reload()
}

export function activeTabForceReload(): void {
  const activeTab = getActiveTab()
  if (activeTab) {
    activeTab.view.webContents.session.clearCache().then(() => activeTab.view.webContents.reload())
  }
}

export function activeTabStop(): void {
  getActiveTab()?.view.webContents.stop()
}

export function activeTabToggleDevTools(): void {
  getActiveTab()?.view.webContents.toggleDevTools()
}

export function switchNextTab(): void {
  mainWindow.webContents.send("switch-next-tab")
}

export function switchPrevTab(): void {
  mainWindow.webContents.send("switch-prev-tab")
}
