<template>
  <div class="page">
    <div class="wrapper">
      <ul>
        <li v-for="item in notifications" :key="item.id">
          <div class="time">{{ item.created_at }}</div>
          <h2>{{ item.title }}</h2>
          <div v-if="item.loading" class="loading"></div>
          <template v-else>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="item.content" class="content" v-html="item.content"></div>
            <button v-else @click="viewContent(item.id)">查看详情</button>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios"
import { onMounted, ref } from "vue"

interface Notification {
  id: number
  title: string
  content?: string
  created_at: string
  loading?: boolean
}

const notifications = ref<Notification[]>([])

onMounted(async () => {
  await axios.get("https://newjstrade.com/api/desktop/notifications").then(({ data }) => {
    data.forEach((item: Notification) => {
      notifications.value.push(item)
      for (let i = 1; i < 20; i++) {
        const copy = structuredClone(item)
        copy.id += i
        notifications.value.push(copy)
      }
    })
    if (data[0]) viewContent(data[0].id)
  })
  console.log(notifications)
})

const viewContent = (id: number): void => {
  const notification = notifications.value.find((item) => item.id === id)!
  notification.loading = true
  axios
    .get("https://newjstrade.com/api/desktop/notifications/" + id)
    .then(({ data }) => {
      notification.content = data.content
    })
    .finally(() => {
      notification.loading = false
    })
}
</script>

<style scoped>
.page {
  * {
    box-sizing: border-box;
  }

  width: 100vw;
  height: 100vh;
  display: flex;
  flex-flow: row nowrap;
  box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
  background-color: #f2f2f2;
  background-image: url("../assets/forex-icon.svg");
  background-size: auto 100%;
  background-position: top left;
  background-repeat: no-repeat;
  padding: 3rem 5rem;
  box-sizing: border-box;

  .wrapper {
    width: 1120px;
    max-width: 100%;
    height: 100%;
    overflow-y: auto;
    margin: auto;
    background-color: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(10px);
    border-radius: 10px;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    /* 滚动条轨道 */

    &::-webkit-scrollbar-track {
      background: #eee;
      border-radius: 0 10px 10px 0;
    }

    /* 滚动条滑块 */

    &::-webkit-scrollbar-thumb {
      background: rgba(22, 34, 91, 0.39);
      border-radius: 0 10px 10px 0;
      transition: background-color 0.2s;
    }

    /* 滑块悬停时 */

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(22, 34, 91, 0.7);
    }
  }
}
</style>
