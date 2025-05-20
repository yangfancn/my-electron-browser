import { defineStore } from "pinia"
import { DownloadState } from "../../../preload/types/download"

export interface DownloadTask {
  id: string
  url: string
  filePath: string
  filename: string
  receivedBytes: number
  totalBytes: number
  progress: number // 0 ~ 100
  state: DownloadState
  createdAt: number
}

export const useDownloadStore = defineStore("downloadStore", {
  state: () => ({
    tasks: [] as DownloadTask[]
  }),
  actions: {
    upsertTask(data: Partial<DownloadTask> & { id: string }) {
      const idx = this.tasks.findIndex((t) => t.id === data.id)
      if (idx >= 0) {
        this.tasks[idx] = { ...this.tasks[idx], ...data }
      } else {
        this.tasks.push({ ...data, state: "downloading" } as DownloadTask)
      }
    },
    setTaskState(id: string, state: DownloadTask["state"]) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) task.state = state
    },
    removeTask(id: string) {
      this.tasks = this.tasks.filter((t) => t.id !== id)
    },
    clearAll() {
      this.tasks = []
    }
  },
  persist: true
})
