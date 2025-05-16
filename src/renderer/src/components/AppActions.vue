<template>
  <div class="app-action">
    <Minimize @click="windowMinimize()" />
    <Maximize @click="toggleWindowMaximize()" />
    <Close @click="windowClose()" />
  </div>
</template>
<script setup lang="ts">
import Maximize from "../assets/maximize.svg"
import Minimize from "../assets/minimize.svg"
import Close from "../assets/close.svg"

const windowMinimize = (): void => {
  window.api.minimize()
}

const windowClose = (): void => {
  window.api.close()
}

const toggleWindowMaximize = (): void => {
  window.api.requestIsMaximized()
  window.api.isMaximized((isMax: boolean) => {
    if (isMax) {
      window.api.unmaximize()
    } else {
      window.api.maximize()
    }
  })
}
</script>

<style scoped>
.app-action {
  display: flex;
  align-items: center;
  margin-left: auto;

  svg {
    width: 40px;
    height: 40px;
    padding: 12px;
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
</style>
