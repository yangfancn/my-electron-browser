// src/renderer/src/stores/tabStore.ts
import { defineStore } from "pinia"
import { v4 as uuidV4 } from "uuid"
import { PresetCookies } from "../../../preload/types"

interface Tab {
  id: string
  url: string
  title?: string
  favicon?: string
  faviconLoadFailed?: boolean
  canGoBack?: boolean
  canGoForward?: boolean
  loading?: boolean
}

export const useTabStore = defineStore("tabs", {
  state: () => ({
    tabs: [] as Tab[],
    activeTabId: null as string | null,
    activeTab: null as Tab | null,
    presetCookies: [] as PresetCookies,
    defaultUrl: "https://forex.com" as string
  }),
  actions: {
    setupTitleListener() {
      window.api.onPageTitleUpdated(({ id, title }) => {
        const tab = this.tabs.find((t) => t.id === id)
        if (tab) tab.title = title
      })
    },
    setupNavigationListener() {
      window.api.onNavigationStateUpdated(({ id, canGoBack, canGoForward }) => {
        const tab = this.tabs.find((t) => t.id === id)
        if (tab) {
          tab.canGoBack = canGoBack
          tab.canGoForward = canGoForward
        }
      })
    },
    setupFaviconListener() {
      window.api.onPageFaviconUpdated(({ id, favicon }) => {
        const tab = this.tabs.find((t) => t.id === id)
        if (tab) tab.favicon = favicon
      })
    },
    setupLoadingListener() {
      window.api.onTabLoadingState(({ id, loading }) => {
        const tab = this.tabs.find((t) => t.id === id)
        if (tab) tab.loading = loading
      })
    },
    setupNewTabHandler() {
      window.api.onNewTabRequested((url) => {
        this.createTab(url, this.presetCookies)
      })
    },
    initListeners() {
      this.setupTitleListener()
      this.setupFaviconListener()
      this.setupNavigationListener()
      this.setupLoadingListener()
      this.setupNewTabHandler()
    },
    createTab(url: string, presetCookies: PresetCookies) {
      const id = uuidV4()
      this.tabs.push({ id, url, loading: true })
      window.api.createTab(id, url, presetCookies)
      this.switchTab(id)
    },
    switchTab(id: string) {
      this.activeTabId = id
      this.activeTab = this.tabs.find((t) => t.id === id) ?? null
      window.api.switchTab(id)
    },
    switchNextTab() {
      if (this.tabs.length <= 1 || !this.activeTabId) return

      const currentIndex = this.tabs.findIndex((t) => t.id === this.activeTabId)
      const nextIndex = (currentIndex + 1) % this.tabs.length
      this.switchTab(this.tabs[nextIndex].id)
    },
    switchPrevTab() {
      if (this.tabs.length <= 1 || !this.activeTabId) return

      const currentIndex = this.tabs.findIndex((t) => t.id === this.activeTabId)
      const prevIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length
      this.switchTab(this.tabs[prevIndex].id)
    },
    closeTab(id: string) {
      const index = this.tabs.findIndex((t) => t.id === id)
      if (index === -1) return

      this.tabs.splice(index, 1)

      if (this.activeTabId === id) {
        let nextTab = this.tabs[index]
        if (!nextTab && index > 0) {
          nextTab = this.tabs[index - 1]
        }

        if (nextTab) {
          this.switchTab(nextTab.id)
        } else {
          this.activeTabId = null
          this.activeTab = null
          window.api.close()
        }
      }

      window.api.closeTab(id)
    }
  }
})
