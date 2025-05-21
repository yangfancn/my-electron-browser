<template>
  <div class="download-page">
    <div class="header">下载</div>
    <div class="task-list">
      <div v-for="task in tasks" :key="task.id" class="task">
        <div class="info">
          <div :class="{ name: true, deleted: task.state === 'deleted' }" @click="open(task)">{{ task.filename }}</div>
          <div v-if="task.state === 'downloading' || task.state === 'paused'" class="progress-bar">
            <div class="bar" :style="{ width: task.percent + '%' }"></div>
          </div>
          <div v-if="task.state === 'interrupted'" class="failed">下载失败</div>
        </div>
        <div class="actions">
          <Pause v-if="task.state === 'downloading'" @click="pause(task.id)" />
          <Play v-else-if="task.state === 'paused'" @click="resume(task.id)" />
          <Folder v-else-if="task.state === 'completed'" @click="showItemInFolder(task.filepath)" />
          <Delete @click="remove(task.id)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDownloadStore, DownloadTask } from "../stores/downloadStore"
import { DownloadProgressData, DownloadState } from "../../../preload/types/download"
import { computed, onMounted } from "vue"
import Pause from "../assets/pause.svg"
import Play from "../assets/play.svg"
import Delete from "../assets/delete.svg"
import Folder from "../assets/folder.svg"

const store = useDownloadStore()
const tasks = computed(() => store.tasks)

window.downloadApi.onProgress((data: DownloadProgressData): void => {
  store.upsertTask({ ...data, state: "downloading" })
  window.downloadApi.showDownload()
  setTimeout(() => {
    window.downloadApi.hideDownload()
  }, 3500)
})

window.downloadApi.onDone((id: string, state: DownloadState): void => {
  store.setTaskState(id, state === "completed" ? "completed" : "interrupted")
})

window.downloadApi.onRemoved((id: string): void => {
  store.removeTask(id)
})

function pause(id: string): void {
  store.pauseTask(id)
}

function resume(id: string): void {
  store.resumeTask(id)
}

function remove(id: string): void {
  store.removeTask(id)
}

function open(task: DownloadTask): void {
  if (task.state === "completed") {
    window.downloadApi.open(task.filepath)
  }
}

function showItemInFolder(filepath: string): void {
  window.downloadApi.showInFolder(filepath)
}

onMounted(() => {
  store.validateTasks()
})
</script>

<style scoped>
.download-page {
  box-sizing: border-box;
  height: 100vh;
  width: 100vw;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  /* 滚动条轨道 */

  &::-webkit-scrollbar-track {
    background: #eee;
    border-radius: 0 10px 10px 0;
  }

  /* 滚动条滑块 */

  &::-webkit-scrollbar-thumb {
    background: rgba(22, 34, 91, 0.39);
    border-radius: 0 10px 10px 0;
    transition: background-color 0.2s;
  }

  /* 滑块悬停时 */

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(22, 34, 91, 0.7);
  }

  .header {
    padding: 8px 12px;
    font-size: 14px;
    border-bottom: 1px solid #ddd;
  }

  .task-list {
    padding: 12px;

    .task {
      width: 100%;
      overflow: hidden;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 10px;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        .actions {
          display: block;
        }
      }

      .info {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .name {
          font-size: 12px;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          cursor: default;

          &.deleted {
            text-decoration: line-through;
          }
        }

        .progress-bar {
          height: 6px;
          background: #eee;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 4px;

          .bar {
            height: 100%;
            background: #4caf50;
            transition: width 0.3s ease;
          }
        }

        .failed {
          font-size: 12px;
          color: #f63232;
        }
      }

      .actions {
        flex-shrink: 0;
        display: none;
        margin-left: 12px;
        line-height: 1;

        svg {
          width: 16px;
          height: 16px;
          fill: #515c67;
          cursor: pointer;
          margin-right: 6px;

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>
