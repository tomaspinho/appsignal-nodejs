import { Appsignal } from "@appsignal/nodejs"

// const LOG_LEVELS = {
//   10: "trace",
//   20: "debug",
//   30: "info",
//   40: "warn",
//   50: "error",
//   60: "fatal"
// }

/**
 * A streamable interface to write log data from Bunyan to
 * AppSignal.
 * 
 * @class
 */
export class AppsignalStream {
  private _client: Appsignal

  constructor(client: Appsignal) {
    this._client = client
  }

  /**
   * A hook function that Bunyan calls when a new log line is
   * emitted. This method will never create a new `Span` - it only
   * adds data to the current `Span`.
   */
  public write(record: any): boolean {
    const {
      err: error,
      tags,
      req
    } = record

    const tracer = this._client.tracer()
    const span = tracer.currentSpan()

    if (span) {
      if (error) span.addError(error.err)
      if (req?.params) span.setSampleData("params", req.params)

      if (tags) {
        Object.entries(tags).forEach(([k, v]) => span.set(k, v as any))
      }
    }

    return true
  }
}
