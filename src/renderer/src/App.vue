<template>
  <div class="app-browser">
    <SplashScreen v-if="loading" />
    <div v-else>
      <div class="app-buttons">
        <button v-for="btn in buttons" :key="btn.label" @click="handleButton(btn)">
          {{ btn.label }}
        </button>
      </div>
      <div class="title-bar">
        <div class="app-icon">
          <img :src="icon" alt="" />
        </div>
        <TabManager v-if="defaultUrl" :default-url="defaultUrl" />
        <div class="app-action">
          <button>
            <Minimize />
          </button>
          <button>
            <Maximize />
          </button>
          <button>
            <Close />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue"
import SplashScreen from "./components/SplashScreen.vue"
import TabManager from "./components/TabManager.vue"
import axios from "axios"
import icon from "@/build/icon.png"
import Minimize from "./assets/minimize.svg"
import Maximize from "./assets/maximize.svg"
import Close from "./assets/close.svg"

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

onBeforeMount(async () => {
  await axios.get("https://newjstrade.com/api/mobile/config").then(({ data }) => {
    loading.value = false
    defaultUrl.value = data.url
  })
  // try {
  //   const res = await fetch('');
  //   const data = await res.json();
  //   defaultUrl.value = data.defaultUrl;
  //   buttons.value = data.buttons;
  // } catch (e) {
  //   console.error('Init API failed', e);
  // } finally {
  //   loading.value = false;
  // }
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
  display: flex;
  align-items: center;
  flex-flow: row nowrap;
  background: #d4e3fc;
  box-sizing: border-box;
  border-bottom: 1px solid #ccc;
  -webkit-app-region: drag;
  user-select: none;
  height: 40px;

  > * {
    -webkit-app-region: no-drag;
  }

  .app-icon {
    padding-left: 10px;
    display: flex;
    align-items: center;
    margin-right: 10px;

    img {
      width: 22px;
      border-radius: 4px;
    }
  }

  .app-action {
    display: flex;
    align-items: center;
    margin-left: auto;

    button {
      padding: 5px 8px;
      background: none;
      border: none;
      outline: none;
      transition: all 0.2s;
      cursor: pointer;
      line-height: 1;

      &:hover {
        background: #fff;
        filter: brightness(1.3);
      }
    }
  }
}
</style>
