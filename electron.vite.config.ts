import { resolve } from "path"
import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import vue from "@vitejs/plugin-vue"
import svgLoader from "vite-svg-loader"
import dotenv from "dotenv"

dotenv.config()

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/index.ts"),
          splash: resolve(__dirname, "src/preload/splash.ts"),
          download: resolve(__dirname, "src/preload/download.ts"),
          notificationDialog: resolve(__dirname, "src/preload/notification-dialog.ts")
        }
      }
    },
    plugins: [externalizeDepsPlugin()],
    define: {
      "process.env.API_DOMAIN": JSON.stringify(process.env.API_DOMAIN),
      "process.env.API_GET_CONFIG_PATH": JSON.stringify(process.env.API_GET_CONFIG_PATH),
      "process.env.REVERB_APP_KEY": JSON.stringify(process.env.REVERB_APP_KEY),
      "process.env.REVERB_HOST": JSON.stringify(process.env.REVERB_HOST),
      "process.env.REVERB_WS_PORT": JSON.stringify(process.env.REVERB_WS_PORT),
      "process.env.REVERB_WSS_PORT": JSON.stringify(process.env.REVERB_WSS_PORT),
      "process.env.APP_CHANNEL": JSON.stringify(process.env.APP_CHANNEL ?? "MircoSite")
    }
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/index.html"),
          splash: resolve(__dirname, "src/renderer/splash.html"),
          notification: resolve(__dirname, "src/renderer/notification.html"),
          download: resolve(__dirname, "src/renderer/download.html"),
          notificationDialog: resolve(__dirname, "src/renderer/notification-dialog.html")
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
