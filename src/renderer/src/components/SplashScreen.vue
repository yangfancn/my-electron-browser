<template>
  <div class="loading-page">
    <Close class="close" @click="closeWindow()" />
    <Logo class="logo" />
  </div>
</template>

<script setup lang="ts">
import Logo from "../assets/logo.svg"
import Close from "../assets/close.svg"

function closeWindow(): void {
  window.api.close()
}
</script>

<style scoped>
.loading-page {
  position: fixed;
  inset: 0;
  background-color: #16225b;
  color: white;
  z-index: 9;
  display: flex;
  justify-content: center;
  align-items: center;

  .close {
    position: fixed;
    top: 15px;
    right: 15px;
    z-index: 99;
    width: 24px;
    height: 24px;
    fill: #fff;
  }

  .logo {
    width: 10vw;
    height: 10vw;
    animation: loading 1.5s ease-in-out infinite alternate;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
    transform-origin: center;
  }
}

@keyframes loading {
  0% {
    opacity: 0.56;
    transform: rotateX(0deg) rotateY(0deg);
  }

  50% {
    opacity: 0.75;
    transform: rotateX(180deg) rotateY(0deg);
  }

  100% {
    opacity: 1;
    transform: rotateX(180deg) rotateY(180deg);
  }
}
</style>
