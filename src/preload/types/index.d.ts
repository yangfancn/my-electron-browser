export interface TabTitleData {
  id: string
  title: string
}

export interface TabFaviconData {
  id: string
  favicon: string
}

export interface PresetCookie {
  url: string
  name: string
  value: string
}

export type PresetCookies = PresetCookie[]
