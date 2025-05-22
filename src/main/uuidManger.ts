import { app } from "electron"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import axios, { AxiosError } from "axios"

interface ServerResponse {
  uuid: string
}

const uuidFilePath = join(app.getPath("userData"), "uuid")

let cachedUUID: string | null = null

export async function getUUID(): Promise<string | null> {
  if (cachedUUID) return cachedUUID

  if (existsSync(uuidFilePath)) {
    try {
      cachedUUID = readFileSync(uuidFilePath, "utf-8").trim()
      return cachedUUID
    } catch (error) {
      console.error(error)
    }
  }

  try {
    const response = await axios.get<ServerResponse>(
      `${process.env.API_DOMAIN}${process.env.API_GENERATE_UUID_PATH}`
    )
    if (response.data.uuid) {
      cachedUUID = response.data.uuid
      writeFileSync(uuidFilePath, cachedUUID)
      return cachedUUID
    } else {
      console.error("UUID Not In Response")
      return null
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("获取 UUID 失败", error.message)
    } else {
      console.error("Unknow Error", error)
    }
    return null
  }
}
