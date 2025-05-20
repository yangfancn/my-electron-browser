<template>
  <div v-show="tasks.length" class="download-page">
    <div class="header">下载</div>
    <div class="task-list">
      <div v-for="task in tasks" :key="task.id" class="task">
        <div class="info">
          <div class="name">{{ task.filename }}</div>
          <div class="progress-bar">
            <div class="bar" :style="{ width: task.progress + '%' }"></div>
          </div>
          <div class="status">{{ getStatusText(task.state) }}</div>
        </div>
        <div class="actions">
          <button @click="togglePause(task)">
            {{ task.state === "paused" ? "恢复" : "暂停" }}
          </button>
          <button @click="remove(task.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDownloadStore, DownloadTask } from "../stores/downloadStore"
import { DownloadProgressData, DownloadState } from "../../../preload/types/download"
import { computed, onMounted } from "vue"
//@todo 下载中的任务 hover 时显示: 暂停和删除 / 下载完成的 hover 时显示: 打开文件夹和删除 点击文件时打开文件/ 取消的任务直接移除 / 删除的任务加上删除线 ---------- 具体参考 Edge
const store = useDownloadStore()
const tasks = computed(() => store.tasks)

console.log(window.downloadApi)

window.downloadApi.onProgress((data: DownloadProgressData): void => {
  store.upsertTask({ ...data, state: "downloading" })
})

window.downloadApi.onDone((id: string, state: DownloadState): void => {
  store.setTaskState(id, state === "completed" ? "completed" : "interrupted")
})

window.downloadApi.onRemoved((id: string): void => {
  store.removeTask(id)
})

function togglePause(task: DownloadTask): void {
  console.log(task.state)
  if (task.state === "paused") {
    window.downloadApi.resume(task.id)
  } else if (task.state === "downloading") {
    window.downloadApi.pause(task.id)
  }
}

function remove(id: string): void {
  window.downloadApi.remove(id)
}

function getStatusText(state: DownloadState): string {
  switch (state) {
    case "downloading":
      return "下载中"
    case "paused":
      return "已暂停"
    case "completed":
      return "已完成"
    case "interrupted":
      return "失败"
    default:
      return "未知"
  }
}

onMounted(() => {
  store.clearAll()
})
</script>

<style scoped>
.download-page {
  overflow-y: auto;

  .header {
    padding: 12px 16px;
    font-weight: bold;
    background-color: #f5f5f5;
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

      &:last-child {
        border-bottom: none;
      }

      .info {
        flex: 1 1 auto;
        margin-right: 12px;
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

        .status {
          font-size: 12px;
          color: #666;
        }
      }

      .actions {
        flex-shrink: 0;
        button {
          margin-left: 8px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
          border: 1px solid #ccc;
          background: #f9f9f9;
          border-radius: 4px;

          &:hover {
            background-color: #eee;
          }
        }
      }
    }
  }
}
</style>
