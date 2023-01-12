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

  static convertToExternalId(input: string): string {
    const externalId = input
      // trim whitespace
      .trim()
      // replace spaces and hyphens with underscores
      .replaceAll(/[\s-]/g, '_')
      // remove anything but a-zA-Z from beginning
      .replace(/^[^a-zA-Z]*/, '')
      // remove anything but a-zA-Z0-9 from end
      .replace(/[^a-zA-Z0-9]*$/, '')
      // remove anything but a-zA-Z0-9_ from middle
      .replaceAll(/[^a-zA-Z0-9_]*/g, '');

    return externalId;
  }
}
