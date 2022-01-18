export abstract class Logger {
  abstract debug(msg: string, ...optionalParams: any[]): void;
  abstract success(msg: string, ...optionalParams: any[]): void;
  abstract info(msg: string, ...optionalParams: any[]): void;
  abstract warn(msg: string, ...optionalParams: any[]): void;
  abstract error(msg: string, ...optionalParams: any[]): void;
  abstract fatal(msg: string, ...optionalParams: any[]): void;
  abstract log(msg: string, ...optionalParams: any[]): void;
}
