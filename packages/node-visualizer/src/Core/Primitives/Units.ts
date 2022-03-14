export class Units {
  public static readonly Feet = 0.3048;

  public static isMeter(unit: string): boolean {
    const comparator = unit.toLowerCase();

    return comparator === 'm' || comparator === 'meter';
  }

  public static isFeet(unit: string): boolean {
    const comparator = unit.toLowerCase();

    return comparator === 'ft' || comparator === 'feet';
  }

  public static covertMeterToFeetAndRounded(value: number): string {
    return this.convertMeterToFeet(value).toFixed(2);
  }

  public static covertFeetToMeterAndRounded(value: number): string {
    return this.convertFeetToMeter(value).toFixed(2);
  }

  public static convertMeterToFeet(value: number): number {
    return value / Units.Feet;
  }

  public static convertFeetToMeter(value: number): number {
    return value * Units.Feet;
  }
}
