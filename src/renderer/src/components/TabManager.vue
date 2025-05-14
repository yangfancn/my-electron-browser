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
        <img v-if="item.favicon" :src="item.favicon" alt="favicon" class="favicon" />
        <Earth v-else class="favicon default-favicon" />
        <span>{{ item.title || "Loading..." }}</span>
        <Close class="close" @click.stop="closeTab(item.id)" />
      </div>
    </vue-draggable>
    <button class="add-tab" @click="addTab()">＋</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { VueDraggable } from "vue-draggable-plus"
import { useTabStore } from "../stores/tabStore"
import Close from "../assets/close.svg"
import Earth from "../assets/earth.svg"

const props = defineProps<{ defaultUrl: string }>()
const tabStore = useTabStore()

function addTab(): void {
  tabStore.createTab(props.defaultUrl)
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
  addTab()
})
</script>

<style scoped>
.app-tabs-container {
  display: flex;
  align-items: flex-end;
  height: 100%;

  .app-tabs {
    display: flex;
    align-items: center;

    & > div {
      flex-grow: 0;
      background: #b9d3ff;
      height: 34px;
      color: #222;
      padding: 5px;
      font-size: 13px;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: space-between;
      border-radius: 5px 5px 0 0;
      max-width: 220px;

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
        margin-right: 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
      }

      svg {
        width: 14px;
        height: 14px;
        fill: #515c67;
        margin: 0;
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
  }
}
</style>
