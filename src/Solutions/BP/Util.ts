export class Util {

  /**
   * Checks the value for number validity
   * @param val: any value
   */
  public static isValidNumber(val: any): boolean {
    const num = parseFloat(val);
    return num ? !!num : (num === 0);
  }
}