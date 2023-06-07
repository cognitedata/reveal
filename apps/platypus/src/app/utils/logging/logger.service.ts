/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogEntry, LogLevel, LogPublisher } from '@platypus/platypus-core';

import { LogPublishersService } from './log-publishers.service';

export class PlatypusLogService {
  level: LogLevel = LogLevel.All;
  logWithDate = true;

  private publishers: LogPublisher[];

  constructor(private publishersService: LogPublishersService) {
    this.publishers = this.publishersService.publishers;
  }

  debug(msg: string, ...optionalParams: any[]): void {
    this.writeToLog(msg, LogLevel.Debug, optionalParams);
  }

  info(msg: string, ...optionalParams: any[]): void {
    this.writeToLog(msg, LogLevel.Info, optionalParams);
  }

  warn(msg: string, ...optionalParams: any[]): void {
    this.writeToLog(msg, LogLevel.Warn, optionalParams);
  }

  error(msg: string, ...optionalParams: any[]): void {
    this.writeToLog(msg, LogLevel.Error, optionalParams);
  }

  fatal(msg: string, ...optionalParams: any[]): void {
    this.writeToLog(msg, LogLevel.Fatal, optionalParams);
  }

  log(msg: string, ...optionalParams: any[]): void {
    this.writeToLog(msg, LogLevel.All, optionalParams);
  }

  private writeToLog(msg: string, level: LogLevel, params: any[]): void {
    if (this.shouldLog(level)) {
      const entry: LogEntry = new LogEntry();
      entry.message = msg;
      entry.level = level;
      entry.extraInfo = params;
      entry.logWithDate = this.logWithDate;

      for (const logger of this.publishers) {
        logger.log(entry);
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    let ret = false;
    if (
      (level >= this.level && level !== LogLevel.Off) ||
      this.level === LogLevel.All
    ) {
      ret = true;
    }
    return ret;
  }
}
