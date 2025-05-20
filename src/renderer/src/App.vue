<template>
  <div class="app-browser">
    <div v-if="defaultUrl">
      <LeftDrawer :buttons="buttons" />
      <div class="title-bar" :style="{ height: `${TITLE_BAR_HEIGHT}px` }">
        <PageActions />
        <TabManager v-if="defaultUrl" :default-url="defaultUrl" />
        <AppActions />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue"
import axios from "axios"
import TabManager from "./components/TabManager.vue"
import PageActions from "./components/PageActions.vue"
import AppActions from "./components/AppActions.vue"
import LeftDrawer, { ButtonInfo } from "./components/LeftDrawer.vue"
import { TITLE_BAR_HEIGHT } from "../../common/const"

const loading = ref(true)
const defaultUrl = ref<string | null>()
const buttons = ref<ButtonInfo[]>([])

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

onBeforeMount(async () => {
  const delayPromise = delay(1500) // 开始计时，不阻塞其他逻辑
  const axiosPromise = axios.get("https://newjstrade.com/api/desktop/config")

  // 先获取 defaultUrl，一旦 axios 返回就赋值
  axiosPromise.then(({ data }) => {
    defaultUrl.value = data.url

    data.buttons.forEach((button: { name: string; icon: string; url: string }) => {
      buttons.value.push({
        label: button.name,
        icon: button.icon,
        action: button.url
      })
    })
  })

  // 等 delay 和 axios 都完成后，才设置 loading = false
  await Promise.all([delayPromise, axiosPromise])
  loading.value = false
})

watch(loading, (val) => {
  if (!val) {
    window.api.closeSplash()
  }
})
</script>

<style scoped>
.title-bar {
  position: relative;
  z-index: 999;
  display: flex;
  align-items: center;
  flex-flow: row nowrap;
  background: #d4e3fc;
  box-sizing: border-box;
  -webkit-app-region: drag;
  user-select: none;
  width: 100%;
  overflow: hidden;

  > * {
    -webkit-app-region: no-drag;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
