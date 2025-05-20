import { createApp } from "vue"
import { createPinia } from "pinia"
import piniaPersist from "pinia-plugin-persistedstate"
import Download from "./components/Download.vue"

const app = createApp(Download)
const pinia = createPinia()
pinia.use(piniaPersist)
app.use(pinia)
app.mount("#download-app")
