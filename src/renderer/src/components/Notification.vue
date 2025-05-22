<template>
  <div class="page">
    <div class="wrapper">
      <ul>
        <li v-for="item in notifications" :key="item.id">
          <div class="time">{{ item.created_at }}</div>
          <h2>{{ item.title }}</h2>
          <div v-if="item.loading" class="loading">
            <div class="loader"></div>
          </div>
          <template v-else>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="item.content" class="content ck-content" v-html="item.content"></div>
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
import "../assets/editor-content.css"

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
      // for (let i = 1; i < 20; i++) {
      //   const copy = structuredClone(item)
      //   copy.id += i
      //   notifications.value.push(copy)
      // }
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
    padding: 2rem;

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

    ul {
      list-style: none;
      padding-left: 3rem;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 1.5rem;
        width: 1px;
        height: 100%;
        border-right: 1px solid rgba(22, 34, 91, 0.79);
      }

      li {
        position: relative;
        margin-bottom: 2rem;

        &::before {
          content: "";
          position: absolute;
          left: calc(-1.5rem - 5px);
          top: 0.125rem;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(22, 34, 91, 0.79);
          background-color: #fff;
          z-index: 2;
          box-shadow: 3px 3px 0 0 rgba(22, 34, 91, 0.5);
        }

        .time {
          font-size: 14px;
          font-weight: 600;
          color: #444;
        }

        h2 {
          font-size: 20px;
          font-weight: 600;
          color: #222;
          margin: 0.5rem 0 1rem;
        }

        button {
          border: 1px solid rgba(22, 34, 91, 0.75);
          background-color: transparent;
          padding: 0.5rem 1rem;
          border-radius: 1.5rem;
          color: rgb(22, 34, 91);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background-color: rgb(22, 34, 91);
            color: #fff;
          }
        }

        .loading {
          padding: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;

          .loader {
            font-weight: bold;
            font-family: monospace;
            font-size: 30px;
            display: inline-grid;
            overflow: hidden;

            &::before,
            &::after {
              content: "Loading...";
              grid-area: 1/1;
              clip-path: inset(0 -200% 50%);
              text-shadow: -10ch 0 0;
              animation: l12 1s infinite;
            }

            &::after {
              clip-path: inset(50% -200% 0%);
              text-shadow: 10ch 0 0;
              --s: -1;
            }
          }
        }

        .content {
          box-sizing: border-box;
          box-shadow: 0 0 5px 1px #ccc;
          padding: 2.5rem;
          word-break: break-all;
        }
      }
    }
  }
}

@keyframes l12 {
  50%,
  100% {
    transform: translateX(calc(var(--s, 1) * 100%));
  }
}
</style>
