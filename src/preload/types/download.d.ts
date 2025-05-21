export type DownloadState =
  | "downloading"
  | "completed"
  | "interrupted"
  | "paused"
  | "cancelled"
  | "deleted"

export interface DownloadProgressData {
  id: string
  filename: string
  filepath: string
  url: string
  received: number
  total: number
  percent: number
}
