<template>
  <div class="app-browser">
    <transition name="fade">
      <SplashScreen v-if="loading" />
    </transition>
    <div v-if="defaultUrl" v-show="!loading">
      <div class="app-buttons">
        <button v-for="btn in buttons" :key="btn.label" @click="handleButton(btn)">
          {{ btn.label }}
        </button>
      </div>
      <div class="title-bar">
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
import SplashScreen from "./components/SplashScreen.vue"
import TabManager from "./components/TabManager.vue"
import PageActions from "./components/PageActions.vue"
import AppActions from "./components/AppActions.vue"

interface ButtonInfo {
  label: string
  icon?: string
  action: string
}

const loading = ref(true)
const defaultUrl = ref<string | null>()
const buttons = ref<ButtonInfo[]>([])

const handleButton = (btn: ButtonInfo): void => {
  if (btn.action === "goHome") {
    console.log("Go Home")
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

onBeforeMount(async () => {
  const delayPromise = delay(1500) // 开始计时，不阻塞其他逻辑
  const axiosPromise = axios.get("https://newjstrade.com/api/mobile/config")

  // 先获取 defaultUrl，一旦 axios 返回就赋值
  axiosPromise.then(({ data }) => {
    defaultUrl.value = data.url
  })

  // 等 delay 和 axios 都完成后，才设置 loading = false
  await Promise.all([delayPromise, axiosPromise])
  loading.value = false
})

watch(loading, (val) => {
  if (!val) {
    window.api.setVisible()
  }
})
</script>

<style scoped>
.app-buttons {
  position: fixed;
  left: 0;
  height: fit-content;
  top: 50%;
  transform: translateY(-50%);
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
  height: 40px;

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
