
export class Units
{
  public static readonly Feet = 0.3048;
  public static isFeet(unit: string): boolean
  {
    unit = unit.toLowerCase();
    if (unit == "ft" || unit == "feet")
      return true;

    return false;
  }
}
