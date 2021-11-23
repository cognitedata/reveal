import { Logger } from '@platypus/platypus-core';
import { red, green, yellow, cyan } from 'chalk';
import _debug from 'debug';

const d = _debug('platypus-cli:general');

export class Log extends Logger {
  debug(msg: string, ...optionalParams: any[]): void {
    d(msg);
  }
  info(msg: string, ...optionalParams: any[]): void {
    console.info(green(msg));
  }
  warn(msg: string, ...optionalParams: any[]): void {
    console.warn(yellow(msg));
  }
  error(msg: string, ...optionalParams: any[]): void {
    console.error(red(msg));
  }
  fatal(msg: string, ...optionalParams: any[]): void {
    this.error(msg, optionalParams);
  }
  log(msg: string, ...optionalParams: any[]): void {
    console.log(cyan(msg));
  }
}
