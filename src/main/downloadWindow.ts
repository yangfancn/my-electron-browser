import { BrowserWindow, ipcMain } from "electron"
import { is } from "@electron-toolkit/utils"
import { join } from "path"
import { v4 as uuidV4 } from "uuid"
import { getLeftDrawerWidth } from "./tabManager"

let downloadWindow: BrowserWindow | null = null
const downloadTasks = new Map<string, Electron.DownloadItem>()

export function createDownloadWindow(parentWindow: BrowserWindow): void {
  if (downloadWindow) return

  const [parentX, parentY] = parentWindow.getBounds().x
    ? [parentWindow.getBounds().x, parentWindow.getBounds().y]
    : [0, 0]

  downloadWindow = new BrowserWindow({
    width: 320,
    height: 400,
    parent: parentWindow,
    frame: false,
    modal: false,
    show: false,
    skipTaskbar: true,
    resizable: false,
    transparent: false,
    hasShadow: false,
    x: parentX + getLeftDrawerWidth(),
    y: parentY + parentWindow.getBounds().height - 400 - 2, // 左下角偏移
    webPreferences: {
      preload: join(__dirname, "../preload/download.js"),
      sandbox: false
    }
  })

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    downloadWindow.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/download.html")
    downloadWindow.webContents.openDevTools({ mode: "detach" })
  } else {
    downloadWindow.loadFile(join(__dirname, "../renderer/download.html"))
  }

  parentWindow.on("move", () => {
    const parentWindowBounds = parentWindow.getBounds()
    const x = parentWindowBounds.x
    const y = parentWindowBounds.y
    downloadWindow?.setBounds(
      {
        x: x + getLeftDrawerWidth(),
        y: y + parentWindow.getBounds().height - 400 - 2,
        width: 320,
        height: 400
      },
      true
    )
  })

  downloadWindow.on("show", () => {
    downloadWindow?.setBounds({
      x: parentWindow.getBounds().x + getLeftDrawerWidth(),
    })
  })

  downloadWindow.on("closed", () => {
    downloadWindow = null
  })
}

// function checkAutoHide(): void {
//   if (downloadTasks.size === 0 && downloadWindow) {
//     downloadWindow.hide()
//   }
// }
export function showDownloadWindow(): void {
  downloadWindow.show()
}

export function hideDownloadWindow(): void {
  downloadWindow.hide()
}

export function registerDownload(item: Electron.DownloadItem): void {
  const id = uuidV4()
  downloadTasks.set(id, item)

  item.on("updated", () => {
    if (item.getSavePath() && !item.isPaused()) {
      downloadWindow?.webContents.send("download-progress", {
        id,
        filename: item.getFilename(),
        filepath: item.getSavePath(),
        url: item.getURL(),
        received: item.getReceivedBytes(),
        total: item.getTotalBytes(),
        percent: Math.floor((item.getReceivedBytes() / item.getTotalBytes()) * 100)
      })
    }
  })

  item.once("done", (_, state) => {
    downloadWindow?.webContents.send("download-done", { id, state })
  })
}

ipcMain.on("download-cancel", (_, id: string) => {
  const item = downloadTasks.get(id)
  console.log(id, item)
  if (item) {
    item.cancel()
  }
})

ipcMain.on("download-remove", (_, id: string) => {
  downloadTasks.delete(id)
  //   checkAutoHide() // 👈 自动隐藏
})

ipcMain.on("download-pause", (_, id: string) => {
  const item = downloadTasks.get(id)
  if (item) item.pause()
})

ipcMain.on("download-resume", (_, id: string) => {
  const item = downloadTasks.get(id)
  if (item && item.isPaused()) item.resume()
})

ipcMain.on("show-download", () => showDownloadWindow())
ipcMain.on("hide-download", () => hideDownloadWindow())
ipcMain.on("toggle-download", () => {
  if (downloadWindow.isVisible()) {
    downloadWindow.hide()
  } else {
    downloadWindow.show()
  }
})
