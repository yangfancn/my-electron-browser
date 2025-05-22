<template>
  <div class="app-browser" :style="{ '--title-bar-height': `${TITLE_BAR_HEIGHT}px` }">
    <LeftDrawer :buttons="buttons" />
    <div class="title-bar">
      <PageActions />
      <TabManager v-if="configLoaded" :preset-cookies="cookies" />
      <AppActions />
    </div>
    <ErrorPage
      v-if="error.code"
      :error-code="error.code"
      :error-description="error.description ?? ''"
      class="error"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch } from "vue"
import axios from "axios"
import TabManager from "./components/TabManager.vue"
import PageActions from "./components/PageActions.vue"
import AppActions from "./components/AppActions.vue"
import LeftDrawer, { ButtonInfo } from "./components/LeftDrawer.vue"
import { TITLE_BAR_HEIGHT } from "../../common/const"
import ErrorPage from "./components/ErrorPage.vue"
import { PresetCookies } from "../../preload/types"
import { useTabStore } from "./stores/tabStore"
import Pusher from "pusher-js"
import Echo from "laravel-echo"

interface Notification {
  id: number
  title: string
  content: string
  timeout: number
}

window.Pusher = Pusher

const loading = ref(true)
const configLoaded = ref<boolean>(false)
const buttons = ref<ButtonInfo[]>([])
const tabStore = useTabStore()
const error = ref<{
  code?: number
  description?: string
}>({})

//@todo 修改后端保存的前置cookies为数组对象
const cookies: PresetCookies = []

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

onBeforeMount(async () => {
  const delayPromise = delay(1500) // 开始计时，不阻塞其他逻辑
  const axiosPromise = axios.get(
    `${window.env.API_DOMAIN}${window.env.API_GET_CONFIG_PATH}?product=${window.env.CHANNEL}`
  )

  // 先获取 defaultUrl，一旦 axios 返回就赋值
  axiosPromise.then(({ data }) => {
    cookies.push({
      url: data.url,
      name: "testTrackingYF",
      value: "txtWebSourceRef=0010070242"
    })

    cookies.push({
      url: data.url,
      name: "cidName",
      value: "mircoSite"
    })

    tabStore.defaultUrl = data.url
    tabStore.presetCookies = data.presetCookies
    configLoaded.value = true

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

onMounted(() => {
  const echo = new Echo({
    broadcaster: "reverb",
    key: window.env.REVERB_APP_KEY,
    wsHost: window.env.REVERB_HOST,
    wsPort: window.env.REVERB_WS_PORT,
    wssPort: window.env.REVERB_WSS_PORT,
    forceTLS: false,
    enabledTransports: ["ws", "wss"]
  })

  echo.channel("notification").listen("DesktopNotificationPublish", (data: Notification) => {
    window.api.showNotificationDialog({
      title: data.title,
      content: data.content,
      timeout: data.timeout
    })
  })
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
