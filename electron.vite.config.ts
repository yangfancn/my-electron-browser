import { resolve } from "path"
import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import vue from "@vitejs/plugin-vue"
import svgLoader from "vite-svg-loader"

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/index.ts"),
          splash: resolve(__dirname, "src/preload/splash.ts")
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      base: process.env.NODE_ENV ? "http://localhost:5173/" : "/",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/index.html"),
          splash: resolve(__dirname, "src/renderer/splash.html"),
          notifications: resolve(
            __dirname,
            "src/renderer/src/internal-pages/notification/index.html"
          )
        }
      }
    },
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
