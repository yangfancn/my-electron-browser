<template>
  <div ref="dialogRef" class="notification-dialog">
    <h1>{{ title }}</h1>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="content ck-content" v-html="content"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue"
import "../assets/editor-content.css"

const content = ref<string | null>(null)
const title = ref<string | null>("通知")
const dialogRef = ref<HTMLDivElement | null>(null)

const close = (): void => window.notificationDialogApi.close()

window.notificationDialogApi.onInitData(async (data) => {
  title.value = data.title
  content.value = data.content
  document.title = title.value

  await nextTick()

  const rect = dialogRef.value!.getBoundingClientRect()
  window.notificationDialogApi.readyToShow({
    width: rect.width + 20,
    height: rect.height + 20
  })

  if (data.timeout) {
    setTimeout(() => close(), data.timeout * 1000)
  }
})
</script>

<style scoped>
.notification-dialog {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #ddd;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
  max-width: 720px;
  max-height: 720px;
  overflow-y: auto;
  overflow-x: hidden;

  h1 {
    text-align: center;
    margin: 0;
    padding: 12px;
    font-size: 18px;
    border-bottom: 2px solid #ddd;
  }

  .content {
    word-break: break-all;

    figure {
      margin-inline-start: 0;
      margin-inline-end: 0;
    }

    img {
      max-width: 100%;
    }
  }
}
</style>
