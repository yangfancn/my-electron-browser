<template>
  <div
    :class="{ 'app-left-drawer': true, opened: open }"
    :style="{
      '--close-width': `${LEFT_DRAWER_CLOSED_WIDTH}px`,
      '--open-width': `${LEFT_DRAWER_OPENED_WIDTH}px`,
      '--duration': `${LEFT_DRAWER_TOGGLE_DURATION}ms`,
      '--top': `${TITLE_BAR_HEIGHT}px`
    }"
  >
    <div class="container">
      <ul class="remote-actions">
        <li v-for="button in buttons" :key="button.action">
          <a :href="button.action" target="_blank" :title="button.label">
            <img :src="button.icon" :alt="button.label" />
            <span>{{ button.label }}</span>
          </a>
        </li>
      </ul>
      <div class="bottom">
        <div class="download">
          <download @click="toggleDownloadWindow()" />
        </div>
        <double-arrow class="toggle" @click="toggleLeftDrawer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import {
  LEFT_DRAWER_CLOSED_WIDTH,
  LEFT_DRAWER_OPENED_WIDTH,
  LEFT_DRAWER_TOGGLE_DURATION,
  TITLE_BAR_HEIGHT
} from "../../../common/const"
import DoubleArrow from "../assets/double_arrow.svg"
import Download from "../assets/download.svg"

export interface ButtonInfo {
  label: string
  icon?: string
  action: string
}

const open = ref<boolean>(false)

defineProps<{
  buttons: ButtonInfo[]
}>()

function toggleDownloadWindow(): void {
  window.api.toggleDownloadWindow()
}

async function toggleLeftDrawer(): Promise<void> {
  open.value = await window.api.toggleLeftDrawer()
}
</script>

<style scoped>
.app-left-drawer {
  --top: unset;
  --open-width: unset;
  --close-width: unset;
  --duration: unset;
  -webkit-app-region: drag;
  user-select: none;
  position: fixed;
  left: 0;
  top: var(--top);
  width: var(--close-width);
  height: calc(100% - var(--top));
  background-color: #e9f1fd;
  transition: width var(--duration) linear;
  box-sizing: border-box;
  box-shadow: inset -1px 0 0 0 #ddd;

  > * {
    -webkit-app-region: no-drag;
  }

  &.opened {
    width: var(--open-width);

    .download .toggle {
      transform: rotate(-190deg);
    }

    .container {
      ul {
        li {
          a {
            width: calc(var(--open-width) * 0.6);
            height: calc(var(--open-width) * 0.6);
            border-radius: 12px;
            box-shadow: 2px 2px 6px 0 rgb(74 89 157);
            border-width: 0;

            img {
              margin-bottom: -1px;
              width: 50%;
            }

            span {
              display: inline-block;
              animation: fz var(--duration) linear;
            }
          }
        }
      }
    }
  }

  .container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    ul {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 0;
      margin: 0;

      li {
        width: 100%;
        margin: 10px 0;

        a {
          text-decoration: none;
          color: #16225b;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: calc(var(--close-width) * 0.75);
          height: calc(var(--close-width) * 0.75);
          margin: auto;
          border-radius: 5px;
          border: 1px solid rgba(22, 34, 91, 0.34);
          transition: all var(--duration) linear;

          img {
            width: 65%;
            height: auto;
            transition: all var(--duration) linear;
          }

          span {
            font-size: 11px;
            font-weight: 500;
            display: none;
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 0;
      display: flex;
      flex-direction: column;

      > * {
        margin-bottom: 0.5rem;

        &:last-child {
          margin-bottom: 0;
        }
      }

      svg {
        width: 16px;
        fill: #515c67;
        transition: all var(--duration);
      }
    }
  }
}

@keyframes fz {
  0% {
    display: none;
    opacity: 0;
    transform: scale(0);
  }

  100% {
    display: inline-block;
    opacity: 1;
    transform: scale(1);
  }
}
</style>
