import { app, shell, BrowserWindow, ipcMain, Menu, protocol, net, session } from "electron"
import { join, basename } from "path"
import { pathToFileURL } from "url"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import dotenv from "dotenv"
import axios, { AxiosError } from "axios"
import { getUUID } from "./uuidManger"
import icon from "../../build/icon.png?asset"
import {
  createTab,
  switchTab,
  closeTab,
  initTabManager,
  activeTabGoBack,
  activeTabGoForward,
  activeTabReload,
  activeTabStop,
  toggleLeftDrawer
} from "./tabManager"
import { createDownloadWindow, registerDownload, hideDownloadWindow } from "./downloadWindow"
import { WindowStateManager } from "./WindowStateManager"
import { registerBrowserShortcuts, unregisterBrowserShortcuts } from "./menu"

dotenv.config()

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null
let notificationDialogWindow: BrowserWindow | null = null
const sessionStartTime = Date.now()
let sessionDurationReported = false
let windowState: WindowStateManager | null = null
let uuid: string | null = null

function reportSessionDuration(): void {
  if (sessionDurationReported || !uuid) return
  sessionDurationReported = true

  axios
    .post(`${process.env.API_DOMAIN}${process.env.API_LOG_APP_DURATION_PATH}` || "", {
      uuid: uuid, // 你之前获取的 uuid
      start_time: sessionStartTime,
      end_time: Date.now()
    })
    .catch((error: AxiosError) => {
      console.error(error.message)
    })
}

function createWindow(): void {
  // Create the splash window
  splashWindow = new BrowserWindow(
    windowState!.applyTo({
      frame: false,
      backgroundColor: "#16225b",
      show: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      webPreferences: {
        preload: join(__dirname, "../preload/splash.js"),
        sandbox: false
      }
    })
  )

  splashWindow.on("ready-to-show", () => {
    splashWindow!.show()
  })

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    splashWindow.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/splash.html")
  } else {
    splashWindow.loadFile(join(__dirname, "../renderer/splash.html"))
  }

  // Create the browser window.
  mainWindow = new BrowserWindow(
    windowState!.applyTo({
      backgroundColor: "#16225b",
      show: false,
      frame: false,
      // ...(process.platform === "linux" ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        sandbox: false
      },
      icon
    })
  )

  windowState!.bindToWindow(mainWindow)

  initTabManager(mainWindow)

  mainWindow.on("ready-to-show", () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    const protocol = new URL(details.url).protocol

    const allowedProtocols = ["http:", "https:", "js-browser:"]
    if (allowedProtocols.includes(protocol)) {
      mainWindow!.webContents.send("new-tab-requested", details.url)
    } else {
      shell.openExternal(details.url).then()
    }
    return { action: "deny" }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]).then()
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html")).then()
  }
  mainWindow.webContents.openDevTools({ mode: "detach" })

  //download window
  createDownloadWindow(mainWindow)

  session.defaultSession.on("will-download", (_, item) => {
    registerDownload(item)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  windowState = new WindowStateManager({
    width: 1200,
    height: 800
  })

  getUUID().then((_) => (uuid = _))

  protocol.handle("js-browser", async (request) => {
    const pathname = request.url.slice("js-browser://".length)
    const filename = basename(pathname)
    const isAssets = pathname.includes("/") || filename.includes(".")
    let fetchUrl: string

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      fetchUrl = isAssets
        ? `${process.env["ELECTRON_RENDERER_URL"]}/${pathname.replace(/^[^/]+\//, "")}`
        : `${process.env["ELECTRON_RENDERER_URL"]}/${filename}.html`
    } else {
      const filePath = isAssets
        ? join(app.getAppPath(), "out", "renderer", "assets", filename)
        : join(app.getAppPath(), "out", "renderer", `${pathname}.html`)

      fetchUrl = pathToFileURL(filePath).toString()
    }
    // console.log("Fetch URL:", fetchUrl)
    return net.fetch(fetchUrl)
  })

  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron")

  //hide default menu
  Menu.setApplicationMenu(null)

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on("will-quit", () => {
    unregisterBrowserShortcuts()
  })

  // IPC test
  // ipcMain.on('ping', () => console.log('pong'))

  //IPC events
  ipcMain.on("index:close-splash", () => {
    splashWindow?.webContents.send("splash:begin-close")
  })
  ipcMain.on("splash:close-ready", () => {
    splashWindow!.hide()
    splashWindow!.close()
    splashWindow = null
  })
  ipcMain.on("tab-create", (_, { id, url, presetCookies }) => createTab(id, url, presetCookies))
  ipcMain.on("tab-switch", (_, id) => switchTab(id))
  ipcMain.on("tab-close", (_, id) => closeTab(id))
  ipcMain.on("window-minimize", () => {
    mainWindow!.minimize()
  })

  ipcMain.on("window-maximize", () => {
    mainWindow!.maximize()
  })

  ipcMain.on("window-unmaximize", () => {
    mainWindow!.unmaximize()
  })

  ipcMain.on("window-close", () => {
    mainWindow!.close()
  })

  //activeTab actions
  ipcMain.on("active-tab-go-back", () => activeTabGoBack())
  ipcMain.on("active-tab-go-forward", () => activeTabGoForward())
  ipcMain.on("active-tab-reload", () => activeTabReload())
  ipcMain.on("active-tab-stop", () => activeTabStop())
  ipcMain.handle("toggle-left-drawer", () => {
    hideDownloadWindow()
    return toggleLeftDrawer()
  })

  //notification window events
  ipcMain.on("notification:close", () => {
    notificationDialogWindow?.close()
    notificationDialogWindow = null
  })
  ipcMain.on("notification:show", (_, data) => {
    if (notificationDialogWindow) return

    notificationDialogWindow = new BrowserWindow({
      // parent: mainWindow,
      frame: false,
      show: false,
      resizable: false,
      movable: true,
      transparent: true,
      hasShadow: false,
      webPreferences: {
        preload: join(__dirname, "../preload/notificationDialog.js"),
        sandbox: false
      }
    })

    notificationDialogWindow?.webContents.once("will-navigate", (_, url) => {
      mainWindow!.webContents!.send("new-tab-requested", url)
      notificationDialogWindow?.close()
      notificationDialogWindow = null
    })

    notificationDialogWindow?.webContents.once("did-finish-load", () => {
      notificationDialogWindow!.webContents.send("init-data", data)
    })

    notificationDialogWindow!.on("close", () => (notificationDialogWindow = null))

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      notificationDialogWindow.loadURL(
        process.env["ELECTRON_RENDERER_URL"] + "/notification-dialog.html"
      )
      // notificationDialogWindow.webContents.openDevTools({ mode: "detach" })
    } else {
      notificationDialogWindow.loadFile(join(__dirname, "../renderer/notification-dialog.html"))
    }
  })

  ipcMain.on("notification:ready-to-show", (_, size) => {
    const mainWindowState = windowState!.getState()

    notificationDialogWindow?.setBounds({
      width: size.width,
      height: size.height,
      x: (mainWindowState.x ?? 0) + (mainWindowState.width - size.width) / 2,
      y: (mainWindowState.y ?? 0) + (mainWindowState.height - size.height) / 2
    })
    notificationDialogWindow?.show()
  })

  createWindow()

  registerBrowserShortcuts()

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

app.on("before-quit", reportSessionDuration)

process.on("exit", reportSessionDuration)
