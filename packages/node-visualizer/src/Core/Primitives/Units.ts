export type ThreeDUnits = 'ft' | 'm';

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

  public static covertMeterToFeetAndRounded(
    value: number,
    decimals = 2
  ): string {
    return this.convertMeterToFeet(value).toFixed(decimals);
  }

  public static covertFeetToMeterAndRounded(
    value: number,
    decimals = 2
  ): string {
    return this.convertFeetToMeter(value).toFixed(decimals);
  }

  public static convertMeterToFeet(value: number): number {
    return value / Units.Feet;
  }

  public static convertFeetToMeter(value: number): number {
    return value * Units.Feet;
  }

  public static convertFeetToUnit(
    unit: string | undefined,
    value: number,
    decimals?: number
  ): string {
    if (unit && this.isMeter(unit)) {
      return this.covertFeetToMeterAndRounded(value, decimals);
    }

    if (decimals) {
      return value.toFixed(decimals);
    }

    return `${value}`;
  }
}
