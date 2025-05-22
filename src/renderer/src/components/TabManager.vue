<template>
  <div class="app-tabs-container">
    <vue-draggable
      v-model="tabStore.tabs"
      class="app-tabs"
      :animation="150"
      ghost-class="ghost"
      @end="onDragEnd"
    >
      <div
        v-for="item in tabStore.tabs"
        :key="item.id"
        :class="{ active: item.id === tabStore.activeTabId }"
        @click="switchTab(item.id)"
      >
        <img
          v-if="item.favicon && !item.faviconLoadFailed"
          :src="item.favicon"
          alt="favicon"
          class="favicon"
          @error="item.faviconLoadFailed = true"
        />
        <Earth v-else class="favicon default-favicon" />
        <span>{{ item.title || "加载中..." }}</span>
        <Close class="close" @click.stop="closeTab(item.id)" />
      </div>
    </vue-draggable>
    <Add class="add-tab" @click="addTab()" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { VueDraggable } from "vue-draggable-plus"
import { useTabStore } from "../stores/tabStore"
import Close from "../assets/close.svg"
import Earth from "../assets/earth.svg"
import Add from "../assets/add.svg"

const tabStore = useTabStore()

function addTab(): void {
  tabStore.createTab(tabStore.defaultUrl, tabStore.presetCookies)
}

function switchTab(id: string): void {
  tabStore.switchTab(id)
}

function closeTab(id: string): void {
  tabStore.closeTab(id)
}

function onDragEnd(): void {
  console.log(tabStore.tabs)
}

onMounted(() => {
  tabStore.initListeners()

  tabStore.tabs.length === 0 && addTab()

  window.api.onTabCloseRequested((id: string) => {
    tabStore.closeTab(id)
  })

  window.api.onSwitchNextTab(() => tabStore.switchNextTab())

  window.api.onSwitchPrevTab(() => tabStore.switchPrevTab())
})
</script>

<style scoped>
.app-tabs-container {
  display: flex;
  align-items: center;
  height: 100%;
  overflow: hidden;
  flex: 0 1 auto;
  margin-right: 80px;

  .app-tabs {
    display: flex;
    align-items: center;
    margin-top: auto;
    flex: 0 1 auto;
    overflow: hidden;

    & > div {
      background: #b9d3ff;
      height: 34px;
      color: #222;
      padding: 5px 8px;
      font-size: 13px;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      border-radius: 5px 5px 0 0;
      transition: background-color 0.35s;
      overflow: hidden;
      flex: 0 1 200px;

      &.ghost {
        opacity: 0.5;
      }

      &.active {
        background: #fff;
        border: 1px solid #ccc;
        border-bottom: none;
      }

      &:not(.active):hover {
        background: #eef;
      }

      .favicon {
        margin-right: 4px;
        width: 14px;
        height: 14px;
        border-radius: 2px;
      }

      span {
        margin-right: auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
      }

      svg {
        width: 14px;
        height: 14px;
        fill: #515c67;
        margin: 0 0 0 5px;
        flex-shrink: 0;
        flex-grow: 0;
        border-radius: 50%;
        padding: 2px;
        transition: background-color 0.2s;

        &:hover {
          background: #ddd;
        }
      }
    }
  }

  .add-tab {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    padding: 2px;
    border-radius: 50%;
    margin: 3px 8px 0;
    transition:
      background-color 0.5s,
      fill 0.5s;

    &:hover {
      background-color: #16225b;
      fill: #fff;
    }
  }
}
</style>
