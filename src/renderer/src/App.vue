<template>
  <div class="app-browser" :style="{ '--title-bar-height': `${TITLE_BAR_HEIGHT}px` }">
    <div v-if="defaultUrl">
      <LeftDrawer :buttons="buttons" />
      <div class="title-bar">
        <PageActions />
        <TabManager v-if="defaultUrl" :default-url="defaultUrl" />
        <AppActions />
      </div>
      <ErrorPage
        v-if="error.code"
        :error-code="error.code"
        :error-description="error.description ?? ''"
        class="error"
      />
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
import ErrorPage from "./components/ErrorPage.vue"

const loading = ref(true)
const defaultUrl = ref<string | null>()
const buttons = ref<ButtonInfo[]>([])
const error = ref<{
  code?: number
  description?: string
}>({})

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

window.api.onNavigationFailed(({ errorCode, errorDescription }) => {
  error.value.code = errorCode
  error.value.description = errorDescription
})

watch(loading, (val) => {
  if (!val) {
    window.api.closeSplash()
  }
})
</script>

<style scoped>
.app-browser {
  --title-bar-height: unset;
}

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
  height: var(--title-bar-height);

  > * {
    -webkit-app-region: no-drag;
  }
}

.error {
  width: 100%;
  height: calc(100vh - var(--title-bar-height));
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
