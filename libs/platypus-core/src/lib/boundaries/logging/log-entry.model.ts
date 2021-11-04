import { LogLevel } from './log-level.enum';

export class LogEntry {
  entryDate: Date = new Date();
  message = '';
  level: LogLevel = LogLevel.Debug;
  extraInfo: any[] = [];
  logWithDate = true;

  buildLogString(): string {
    const ret = [];

    if (this.logWithDate) {
      ret.push(new Date());
    }

    ret.push(`Type: ${LogLevel[this.level]}`);
    ret.push(`Message: ${this.message}`);

    if (this.extraInfo.length) {
      ret.push(`Extra Info: ${this.formatParams(this.extraInfo)}`);
    }

    return ret.join('\n');
  }

  private formatParams(params: any[]): string {
    let ret: string = params.join(',');

    // Is there at least one object in the array?
    // eslint-disable-next-line
    if (params.some((p) => typeof p === 'object')) {
      ret = '';
      // Build comma-delimited string
      for (const item of params) {
        ret += JSON.stringify(item) + ',';
      }
    }

    return ret;
  }
}
