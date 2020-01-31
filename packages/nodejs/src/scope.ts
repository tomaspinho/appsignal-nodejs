import * as asyncHooks from "async_hooks"

import { ISpan } from "./interfaces/ISpan"

/**
 * Propagates specific scope between function calls and async operations.
 *
 * @class
 *
 * @copyright
 * Uses portions of `opentelemetry-js`
 * https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-scope-async-hooks/src/AsyncHooksScopeManager.ts
 * Copyright 2019, OpenTelemetry Authors
 */
export class ScopeManager {
  private _scopes: Map<number, ISpan | undefined>
  private _asyncHook: asyncHooks.AsyncHook

  constructor() {
    this._scopes = new Map()

    const init = (uid: number) => {
      this._scopes.set(
        uid,
        this._scopes.get(asyncHooks.executionAsyncId()) || undefined
      )
    }

    const destroy = (uid: number) => {
      this._scopes.delete(uid)
    }

    this._asyncHook = asyncHooks.createHook({
      init: init,
      destroy: destroy,
      promiseResolve: destroy
    })
  }

  /**
   * Enables the async hook.
   */
  public enable(): this {
    this._asyncHook.enable()
    return this
  }

  /**
   * Disables the async hook and clears the current `Spans`. Will generally
   * only need to be called by the test suite.
   */
  public disable(): this {
    this._asyncHook.disable()
    this._scopes = new Map()
    return this
  }

  /**
   * Returns the current active `Span`.
   */
  public active(): ISpan | undefined {
    const uid = asyncHooks.executionAsyncId()
    return this._scopes.get(uid) || undefined
  }

  /**
   * Executes a given function asynchronously within the context of a given `Span`.
   */
  public async with(
    span: ISpan,
    fn: (s: ISpan) => Promise<any> | any
  ): Promise<any> {
    const uid = asyncHooks.executionAsyncId()
    const oldScope = this._scopes.get(uid)

    this._scopes.set(uid, span)

    try {
      return await fn(span)
    } catch (err) {
      span.addError(err)
      throw err
    } finally {
      // revert to the previous span
      if (oldScope === undefined) {
        this._scopes.delete(uid)
      } else {
        this._scopes.set(uid, oldScope)
      }
    }
  }

  /**
   * Executes a given function synchronously within the context of a given `Span`.
   */
  public withSync(span: ISpan, fn: (s: ISpan) => any): any {
    const uid = asyncHooks.executionAsyncId()
    const oldScope = this._scopes.get(uid)

    this._scopes.set(uid, span)

    try {
      return fn(span)
    } catch (err) {
      span.addError(err)
      throw err
    } finally {
      // revert to the previous span
      if (oldScope === undefined) {
        this._scopes.delete(uid)
      } else {
        this._scopes.set(uid, oldScope)
      }
    }
  }
}
