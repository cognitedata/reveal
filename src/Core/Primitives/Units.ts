export class Units {
  public static readonly Feet = 0.3048;

  public static isFeet(unit: string): boolean {
    const comparator = unit.toLowerCase();

    return comparator === "ft" || comparator === "feet";
  }

  public static convertMeterToFeet(value: number): number {
    return value / Units.Feet
  }

  public static convertFeetToMeter(value: number): number {
    return value * Units.Feet
  }
}