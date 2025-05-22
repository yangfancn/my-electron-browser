/// <reference types="vite/client" />
export {}

declare global {
  interface Window {
    Pusher: typeof import("pusher-js").default
  }
}
