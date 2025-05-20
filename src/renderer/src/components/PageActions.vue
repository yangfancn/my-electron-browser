<template>
  <div class="page-action">
    <Back :class="{ disable: !tabStore.activeTab?.canGoBack }" @click="activeTabGoBack()" />
    <Forward
      :class="{ disable: !tabStore.activeTab?.canGoForward }"
      @click="activeTabGoForward()"
    />
    <Close v-if="tabStore.activeTab?.loading" @click="activeTabStop()" />
    <Refresh v-else @click="activeTabReload()" />
  </div>
</template>

<script setup lang="ts">
import { useTabStore } from "../stores/tabStore"
import Refresh from "../assets/refresh.svg"
import Back from "../assets/back.svg"
import Forward from "../assets/forward.svg"
import Close from "../assets/close.svg"

const tabStore = useTabStore()
const activeTabGoBack = (): void => window.api.activeTabGoBack()
const activeTabGoForward = (): void => window.api.activeTabGoForward()
const activeTabReload = (): void => window.api.activeTabReload()
const activeTabStop = (): void => window.api.activeTabStop()
</script>

<style scoped>
.page-action {
  display: flex;
  align-items: center;

  svg {
    width: 26px;
    height: 26px;
    padding: 5px;
    border-radius: 50%;
    margin: 3px 5px 0;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    line-height: 1;
    transition:
      background-color 0.35s,
      fill 0.35s;

    &.disable {
      fill: #adabab;
    }

    &:hover {
      background: #134191;
      fill: #fff;
    }
  }
}
</style>
