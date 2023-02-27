import { LogEntry } from './log-entry.model';

export abstract class LogPublisher {
  abstract log(record: LogEntry): Promise<boolean>;
  abstract clear(): Promise<boolean>;
}
