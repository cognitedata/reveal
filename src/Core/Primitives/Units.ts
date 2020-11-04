export class Units {
  public static readonly Feet = 0.3048;

  public static isFeet(unit: string): boolean {
    const comparator = unit.toLowerCase();

    return comparator === "ft" || comparator === "feet";
  }
}