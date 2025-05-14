// src/renderer/src/stores/tabStore.ts
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'
import { ipcRenderer } from 'electron'

export const useTabStore = defineStore('tabs', () => {
  const tabs = ref<{ id: string, url: string, title?: string }[]>([])
  const activeTabId = ref<string | null>(null)

  function createTab(url: string) {
    const id = uuidv4()
    tabs.value.push({ id, url })
    activeTabId.value = id

    ipcRenderer.send('tab-create', { id, url })
  }

  function switchTab(id: string) {
    activeTabId.value = id
    ipcRenderer.send('tab-switch', id)
  }

  function closeTab(id: string) {
    tabs.value = tabs.value.filter(t => t.id !== id)
    if (activeTabId.value === id) {
      activeTabId.value = tabs.value.at(-1)?.id || null
      if (activeTabId.value) {
        switchTab(activeTabId.value)
      }
    }
    ipcRenderer.send('tab-close', id)
  }

  return { tabs, activeTabId, createTab, switchTab, closeTab }
})
