export interface ILoader {
  load(node: any): void;

  parse(node: any, buffer: ArrayBuffer): void;
}
