// src/renderer/src/stores/tabStore.ts
import { defineStore } from "pinia"
import { v4 as uuidV4 } from "uuid"
import { ref } from "vue"

interface Tab {
  id: string
  url: string
  title?: string
  favicon?: string
  canGoBack?: boolean
  canGoForward?: boolean
  loading?: boolean
}

export const useTabStore = defineStore("tabs", () => {
  const tabs = ref<Tab[]>([])
  const activeTabId = ref<string | null>(null)
  const activeTab = ref<Tab | null>(null)

  function setupTitleListener(): void {
    window.api.onPageTitleUpdated(({ id, title }) => {
      const tab = tabs.value.find((t) => t.id === id)
      if (tab) {
        tab.title = title
      }
    })
  }

  function setupNavigationListener(): void {
    window.api.onNavigationStateUpdated(({ id, canGoBack, canGoForward }) => {
      const tab = tabs.value.find((t) => t.id === id)
      if (tab) {
        tab.canGoBack = canGoBack
        tab.canGoForward = canGoForward
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

  function setupLoadingListener(): void {
    window.api.onTabLoadingState(({ id, loading }) => {
      const tab = tabs.value.find((t) => t.id === id)
      if (tab) {
        tab.loading = loading
      }
    })
  }

  function setupNewTabHandler(): void {
    window.api.onNewTabRequested((url) => {
      createTab(url)
    })
  }

  function createTab(url: string): void {
    const id = uuidV4()
    tabs.value.push({ id, url, loading: true })
    window.api.createTab(id, url)
    switchTab(id)
  }

  function switchTab(id: string): void {
    activeTabId.value = id
    activeTab.value = tabs.value.find((t) => t.id === id) ?? null
    window.api.switchTab(id)
  }

  function closeTab(id: string): void {
    const index = tabs.value.findIndex((t) => t.id === id)
    if (index === -1) return

    tabs.value.splice(index, 1)

    if (activeTabId.value === id) {
      let nextTab = tabs.value[index]
      if (!nextTab && index > 0) {
        nextTab = tabs.value[index - 1]
      }

      if (nextTab) {
        switchTab(nextTab.id)
      } else {
        activeTabId.value = null
        activeTab.value = null
        window.api.close()
      }
    }

    window.api.closeTab(id)
  }

  setupTitleListener()

  setupFaviconListener()

  setupNavigationListener()

  setupLoadingListener()

  setupNewTabHandler()

  return { tabs, activeTabId, activeTab, createTab, switchTab, closeTab }
})
