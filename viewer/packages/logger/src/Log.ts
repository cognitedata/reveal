/*!
 * Copyright 2021 Cognite AS
 */

import * as log from 'loglevel';
import { env } from 'process';

/**
 * Replacement for `console.log` etc for logging in Reveal.
 */
export class Log {
  private static _singleton: Log = (() => {
    const { VERSION, IS_DEVELOPMENT_MODE } = env;
    const logger = new Log();
    logger.info(`Reveal ${VERSION} (development: ${IS_DEVELOPMENT_MODE})`);
    return logger;
  })();

  private readonly _logger: log.Logger;

  private constructor(logger: log.Logger = log.default) {
    this._logger = logger;
  }

  static trace(...msg: any[]) {
    Log._singleton.trace(msg);
  }

  static debug(...msg: any[]) {
    Log._singleton.debug(msg);
  }

  static info(...msg: any[]) {
    Log._singleton.info(msg);
  }

  static warn(...msg: any[]) {
    Log._singleton.warn(msg);
  }

  static error(...msg: any[]) {
    Log._singleton.error(msg);
  }

  private trace(...msg: any[]) {
    this._logger.trace(msg);
  }

  private debug(...msg: any[]) {
    this._logger.debug(msg);
  }

  private info(...msg: any[]) {
    this._logger.info(msg);
  }

  private warn(...msg: any[]) {
    this._logger.warn(msg);
  }

  private error(...msg: any[]) {
    this._logger.error(msg);
  }

}
