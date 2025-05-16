import { app, shell, BrowserWindow, ipcMain, Menu } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import icon from "../../build/icon.png?asset"
import { createTab, switchTab, closeTab, initTabManager, setVisible } from "./tabManager"

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
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
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).then()
    return { action: "deny" }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]).then()
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html")).then()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
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
  ipcMain.on("config-loaded", () => setVisible())
  ipcMain.on("tab-create", (_, { id, url }) => createTab(id, url))
  ipcMain.on("tab-switch", (_, id) => switchTab(id))
  ipcMain.on("tab-close", (_, id) => closeTab(id))
  ipcMain.on("window-minimize", () => {
    mainWindow.minimize()
  })

  ipcMain.on("window-maximize", () => {
    mainWindow.maximize()
  })

  ipcMain.on("window-unmaximize", () => {
    mainWindow.unmaximize()
  })

  ipcMain.on("window-close", () => {
    mainWindow.close()
  })

  ipcMain.on("request-is-maximized", () => {
    mainWindow.webContents.send("window-is-maximized", mainWindow.isMaximized())
  })

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
