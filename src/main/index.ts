import { app, shell, BrowserWindow, ipcMain, Menu, protocol, net, session } from "electron"
import { join, basename } from "path"
import { pathToFileURL } from "url"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
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
import { createDownloadWindow, registerDownload } from "./downloadWindow"

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the splash window
  splashWindow = new BrowserWindow({
    width: 1200,
    height: 800,
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

  splashWindow.on("ready-to-show", () => {
    splashWindow!.show()
  })

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    splashWindow.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/splash.html")
  } else {
    splashWindow.loadFile(join(__dirname, "../renderer/splash.html"))
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#16225b",
    show: false,
    autoHideMenuBar: true,
    frame: false,
    // ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    },
    icon
  })

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
    mainWindow.webContents.openDevTools({ mode: "detach" })
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html")).then()
  }

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

  // IPC test
  // ipcMain.on('ping', () => console.log('pong'))

  //IPC events
  ipcMain.on("index:close-splash", () => {
    splashWindow!.webContents.send("splash:begin-close")
  })
  ipcMain.on("splash:close-ready", () => {
    splashWindow!.hide()
    splashWindow!.close()
  })
  ipcMain.on("tab-create", (_, { id, url }) => createTab(id, url))
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

  ipcMain.on("request-is-maximized", () => {
    mainWindow!.webContents.send("window-is-maximized", mainWindow!.isMaximized())
  })

  //activeTab actions
  ipcMain.on("active-tab-go-back", () => activeTabGoBack())
  ipcMain.on("active-tab-go-forward", () => activeTabGoForward())
  ipcMain.on("active-tab-reload", () => activeTabReload())
  ipcMain.on("active-tab-stop", () => activeTabStop())
  ipcMain.handle("toggle-left-drawer", () => toggleLeftDrawer())

  createWindow()

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
