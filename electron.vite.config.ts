import { resolve } from "path"
import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import vue from "@vitejs/plugin-vue"
import svgLoader from "vite-svg-loader"

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve("./"),
        "@renderer": resolve("src/renderer/src"),
        "@stores": resolve("src/renderer/stores")
      }
    },
    plugins: [vue(), svgLoader()]
  }
})
