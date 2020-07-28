import { Action, Retrieve } from "@/Core/Property/Base/BaseProperty";
import StringProperty from "@/Core/Property/Concrete/Property/StringProperty";
import ColorProperty from "@/Core/Property/Concrete/Property/ColorProperty";
import Color from "color";
import { Range1 } from "@/Core/Geometry/Range1";
import { Range3 } from "@/Core/Geometry/Range3";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";

const FractionDigitsDefault = 2;

export class PropertyFolder extends BasePropertyFolder
{
  constructor(name: string)
  {
    super(name);
  }

  // public Add(property: UsePropertyT<any>){  todo: add this after correct concrete property class can be derived from  parameters
  //   this.AddChild(property);
  // }
  public addStringProperty(name: string, value: string | Retrieve<string>, readonly?: boolean, instance?: object,
    applyDelegate?: Action<void>, valueDelegate?: Action<string>): void
  {
    const property = new StringProperty(name, value, readonly, instance, applyDelegate, valueDelegate);
    this.addChild(property);
  }

  public addColorProperty(name: string, value: Color | Retrieve<Color>, readonly?: boolean, instance?: object,
    applyDelegate?: Action<void>, valueDelegate?: Action<Color>): void
  {
    const property = new ColorProperty(name, value, readonly, instance, applyDelegate, valueDelegate);
    this.addChild(property);
  }

  //==================================================
  // INSTANCE METHODS: Add read only values
  //==================================================

  public addReadOnlyInteger(name: string, value: number): void
  {
    this.addReadOnlyStrings(name, value.toString());
  }

  public addReadOnlyNumber(name: string, value: number, fractionDigits = FractionDigitsDefault): void
  {
    this.addReadOnlyStrings(name, value.toFixed(fractionDigits));
  }

  public addReadOnlyRange1(name: string, range: Range1, fractionDigits = FractionDigitsDefault): void
  {
    if (!range.isEmpty)
      return;
    this.addReadOnlyStrings(name + "[min/delta/max]", range.min.toFixed(fractionDigits), range.delta.toFixed(fractionDigits), range.max.toFixed(fractionDigits));
  }

  public addReadOnlyRange3(name: string, range: Range3, fractionDigits: number = FractionDigitsDefault): void
  {
    this.addReadOnlyRange1(name + "X", range.x, fractionDigits);
    this.addReadOnlyRange1(name + "Y", range.x, fractionDigits);
    this.addReadOnlyRange1(name + "Z", range.x, fractionDigits);
  }

  public addReadOnlyVector2(name: string, x: number, y: number, fractionDigits = FractionDigitsDefault): void
  {
    this.addReadOnlyStrings(name, x.toFixed(fractionDigits), y.toFixed(fractionDigits));
  }

  public addReadOnlyStrings(name: string, s1: string, s2?: string, s3?: string, s4?: string): void
  {
    //Not implemented yet
  }
}
