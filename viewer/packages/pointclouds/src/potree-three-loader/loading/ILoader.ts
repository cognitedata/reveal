export interface ILoader {
  load(node: any): Promise<void>;

  parse(node: any, buffer: ArrayBuffer): void;
}
