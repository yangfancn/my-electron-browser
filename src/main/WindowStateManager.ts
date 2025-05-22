import { app, BrowserWindow } from "electron"
import { writeFileSync, readFileSync } from "fs"
import { join } from "path"

interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
}

export class WindowStateManager {
  private readonly filePath: string
  private readonly defaultState: WindowState
  private state: WindowState

  constructor(defaultState: WindowState) {
    this.filePath = join(app.getPath("userData"), "window-state.json")
    this.defaultState = defaultState
    this.state = this.loadState()
  }

  private loadState(): WindowState {
    try {
      const data = readFileSync(this.filePath, "utf-8")
      const parsed = JSON.parse(data)
      // 简单校验
      if (
        typeof parsed.x === "number" &&
        typeof parsed.y === "number" &&
        typeof parsed.width === "number" &&
        typeof parsed.height === "number"
      ) {
        return parsed
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //console.error(error)
    }
    return this.defaultState
  }

  getState(): WindowState {
    return this.state
  }

  applyTo(
    windowOptions: Electron.BrowserWindowConstructorOptions
  ): Electron.BrowserWindowConstructorOptions {
    return {
      ...windowOptions,
      x: this.state.x,
      y: this.state.y,
      width: this.state.width,
      height: this.state.height
    }
  }

  bindToWindow(win: BrowserWindow): void {
    win.on("close", () => {
      if (!win.isMinimized() && !win.isMaximized()) {
        this.state = win.getBounds()
        writeFileSync(this.filePath, JSON.stringify(this.state))
      }
    })
  }
}
