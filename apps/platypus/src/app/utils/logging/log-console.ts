/* eslint-disable no-console */
import { LogEntry, LogPublisher } from '@platypus/platypus-core';

export class LogConsole extends LogPublisher {
  log(entry: LogEntry): Promise<boolean> {
    // Log to console
    console.log(entry.buildLogString());
    return Promise.resolve(true);
  }
  clear(): Promise<boolean> {
    console.clear();
    return Promise.resolve(true);
  }
}
