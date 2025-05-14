// src/renderer/src/stores/tabStore.ts
import { defineStore } from "pinia"
import { v4 as uuidV4 } from "uuid"
import { ref } from "vue"

export const useTabStore = defineStore("tabs", () => {
  const tabs = ref<
    {
      id: string
      url: string
      title?: string
      favicon?: string
    }[]
  >([])
  const activeTabId = ref<string | null>(null)

  function setupTitleListener(): void {
    window.api.onPageTitleUpdated(({ id, title }) => {
      const tab = tabs.value.find((t) => t.id === id)
      if (tab) {
        tab.title = title
      }
    })
  }
  function setupFaviconListener(): void {
    window.api.onPageFaviconUpdated(({ id, favicon }) => {
      const tab = tabs.value.find((t) => t.id === id)
      if (tab) {
        tab.favicon = favicon
      }
    })
  }

  function createTab(url: string): void {
    const id = uuidV4()
    tabs.value.push({ id, url })
    activeTabId.value = id
    window.api.createTab(id, url)
    switchTab(id)
  }

  function switchTab(id: string): void {
    activeTabId.value = id
    window.api.switchTab(id)
  }

  function closeTab(id: string): void {
    tabs.value = tabs.value.filter((t) => t.id !== id)
    if (activeTabId.value === id) {
      activeTabId.value = tabs.value.at(-1)?.id || null
      if (activeTabId.value) {
        switchTab(activeTabId.value)
      }
    }
    window.api.closeTab(id)
  }

  setupTitleListener()

  setupFaviconListener()

  return { tabs, activeTabId, createTab, switchTab, closeTab }
})
