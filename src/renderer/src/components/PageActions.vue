<template>
  <div class="page-action">
    <Back :class="{ disable: !tabStore.activeTab?.canGoBack }" />
    <Forward :class="{ disable: !tabStore.activeTab?.canGoForward }" />
    <Close v-if="tabStore.activeTab?.loading" />
    <Refresh v-else />
  </div>
</template>

<script setup lang="ts">
import { useTabStore } from "../stores/tabStore"
import Refresh from "../assets/refresh.svg"
import Back from "../assets/back.svg"
import Forward from "../assets/forward.svg"
import Close from "../assets/close.svg"

const tabStore = useTabStore()
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
