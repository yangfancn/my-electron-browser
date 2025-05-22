<template>
  <h1 @click="hide()">Notification Dialog</h1>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="content" v-html="content"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import Echo from "laravel-echo"
import Pusher from "pusher-js"

const content = ref<string | null>(null)

window.Pusher = Pusher

interface Notification {
  id: number
  title: string
  content: string
  timeout: number
  all: boolean
}

const hide = (): void => window.notificationDialogApi.hide()
const show = (): void => window.notificationDialogApi.show()

onMounted(async () => {
  const echo = new Echo({
    broadcaster: "reverb",
    key: "6wq38bavj6p6wixwjw3z",
    wsHost: "newjstrade.com",
    wsPort: 8080,
    wssPort: 443,
    forceTLS: false,
    enabledTransports: ["ws", "wss"]
  })

  echo.channel("notification").listen("DesktopNotificationPublish", (data: Notification) => {
    console.log("show", data)
    content.value = data.content
    show()

    if (data.timeout) {
      setTimeout(() => {
        hide()
      }, data.timeout * 1000)
    }
  })
})
</script>
