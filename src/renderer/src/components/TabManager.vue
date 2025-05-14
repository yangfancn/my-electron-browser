<template>
  <div class="app-content">
    <div class="app-tabs-container">
      <vue-draggable v-model="tabs" class="app-tabs" item-key="id" @end="onDragEnd">
        <div
          v-for="(item, index) in tabs"
          :key="item.id"
          :class="{ 'font-bold text-blue-600': index === activeIndex }"
          @click="switchTab(index)"
        >
          <span>{{ item.title || "Loading..." }}</span>
          <button @click.stop="closeTab(index)">×</button>
        </div>
      </vue-draggable>
      <button class="add-tab" @click="addTab()">＋</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { VueDraggable } from "vue-draggable-plus"

interface TabData {
  id: number
  url: string
  title: string
}

const props = defineProps<{ defaultUrl: string }>()
const tabs = ref<TabData[]>([])
const activeIndex = ref(0)
let tabIdCounter = 0

function addTab(): void {
  const id = tabIdCounter++
  const newTab: TabData = {
    id,
    url: props.defaultUrl,
    title: props.defaultUrl
  }
  tabs.value.push(newTab)
  activeIndex.value = tabs.value.length - 1

  // 通知主进程创建标签
  window.api.createTab(id, newTab.url)
  window.api.switchTab(id)
}

function switchTab(index: number): void {
  activeIndex.value = index
  const tab = tabs.value[index]
  if (tab) {
    window.api.switchTab(tab.id)
  }
}

function closeTab(index: number): void {
  const closed = tabs.value.splice(index, 1)[0]
  if (!closed) return

  // 通知主进程关闭标签
  window.api.closeTab(closed.id)

  if (activeIndex.value === index) {
    // 如果关闭的是当前标签，则切换到前一个或第一个
    const newIndex = index > 0 ? index - 1 : 0
    activeIndex.value = newIndex
    const fallbackTab = tabs.value[newIndex]
    if (fallbackTab) window.api.switchTab(fallbackTab.id)
  } else if (activeIndex.value > index) {
    activeIndex.value--
  }
}

function onDragEnd(): void {
  const activeTab = tabs.value[activeIndex.value]
  if (!activeTab) return

  // 拖动结束后找出当前激活 tab 的新位置
  const newIndex = tabs.value.findIndex((t) => t.id === activeTab.id)
  if (newIndex !== -1) {
    activeIndex.value = newIndex
  }
}

onMounted(() => {
  addTab()
})
</script>

<style scoped>
.app-tabs-container {
  display: flex;
  align-items: flex-end;
  background: #d4e3fc;
  border-bottom: 1px solid #ccc;
  height: 40px;

  .app-tabs {
    display: flex;
    align-items: center;

    & > div {
      height: 34px;
      border-radius: 5px 5px 0 0;
      background: #fff;
      color: #222;
      white-space: nowrap;
      overflow: hidden;
      border: 1px solid #ccc;
      border-bottom: none;
      padding: 5px;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &:hover {
        background: #eef;
      }

      span {
        line-height: 1;
        margin-right: 5px;
      }

      button {
        background: none;
        border: none;
        outline: none;
      }
    }
  }

  .add-tab {
    flex-shrink: 0;
  }
}
</style>
