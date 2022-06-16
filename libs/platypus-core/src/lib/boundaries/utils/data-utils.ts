export class DataUtils {
  static isString(obj: unknown): boolean {
    return Object.prototype.toString.call(obj) === '[object String]';
  }

  static isNumber(obj: unknown): boolean {
    return !isNaN(obj as any) && !isNaN(parseFloat(obj as string));
  }

  static isArray(obj: unknown): boolean {
    return Array.isArray(obj);
  }

  static convertToCamelCase(input: string): string {
    const regex = /\s+(\w)?/gi;

    return input
      .toLowerCase()
      .replace(regex, (match, letter) => letter.toUpperCase());
  }
}
