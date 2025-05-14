<template>
  <div>
    <SplashScreen v-if="loading" />
    <div>
      <div class="app-buttons">
        <button
          v-for="btn in buttons"
          :key="btn.label"
          @click="handleButton(btn)"
        >
          {{ btn.label }}
        </button>
      </div>
      <TabManager v-if="defaultUrl" :default-url="defaultUrl" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import SplashScreen from './components/SplashScreen.vue';
import TabManager from './components/TabManager.vue';
import axios from 'axios';

interface ButtonInfo {
  label: string;
  icon?: string;
  action: string;
}

const loading = ref(true);
const defaultUrl = ref<string | null>();
const buttons = ref<ButtonInfo[]>([]);

const handleButton = (btn: ButtonInfo) => {
  if (btn.action === 'goHome') {
    console.log('Go Home');
  }
};

onBeforeMount(async () => {
  await axios.get('https://newjstrade.com/api/mobile/config').then(({data}) => {
    loading.value = false;
    defaultUrl.value = data.url;
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
});
</script>

<style scoped>
.app-buttons {
  position: fixed;
  left: 0;
  height: fit-content;
  top: 50%;
  transform: translateY(-50%);
}
</style>
