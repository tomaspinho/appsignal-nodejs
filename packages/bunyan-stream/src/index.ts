import { Appsignal } from "@appsignal/nodejs"
import Logger from "bunyan"

import { AppsignalStream } from "./stream"

export function createAppsignalStream(
  client: Appsignal,
  level?: Logger.LogLevelString
): Logger.Stream {
  return {
    stream: new AppsignalStream(client) as any,
    type: "raw",
    level: level || "warn"
  }
}

export { AppsignalStream }
