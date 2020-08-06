import Color from "color";
import { Action, Retrieve } from "@/Core/Property/Base/BaseProperty";
import StringProperty from "@/Core/Property/Concrete/Property/StringProperty";
import ColorProperty from "@/Core/Property/Concrete/Property/ColorProperty";
import StringGroupProperty from "@/Core/Property/Concrete/Property/StringGroupProperty";
import { Range1 } from "@/Core/Geometry/Range1";
import { Range3 } from "@/Core/Geometry/Range3";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { Index3 } from "@/Core/Geometry/Index3";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Index2 } from "@/Core/Geometry/Index2";
import { Ma } from "@/Core/Primitives/Ma";

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

  public addStringGroupProperty(name: string, values: string[], readonly: boolean): void
  {
    const property = new StringGroupProperty(name, true);
    for (const [index, value] of values.entries())
    {
      property.addChild(new StringProperty(name + index, value, readonly));
    }
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

  public addReadOnlyAngle(name: string, value: number): void
  {
    this.addReadOnlyStrings(name, Ma.toDeg(value).toFixed(2) + " [degrees]");
  }

  public addReadOnlyRange1(name: string, range: Range1, fractionDigits = FractionDigitsDefault): void
  {
    if (!range.isEmpty)
      this.addReadOnlyStrings(`${name}[min/delta/max]`, range.min.toFixed(fractionDigits), range.delta.toFixed(fractionDigits), range.max.toFixed(fractionDigits));
  }

  public addReadOnlyRange3(range: Range3, fractionDigits: number = FractionDigitsDefault): void
  {
    this.addReadOnlyRange1(`X`, range.x, fractionDigits);
    this.addReadOnlyRange1(`Y`, range.y, fractionDigits);
    this.addReadOnlyRange1(`Z`, range.z, fractionDigits);
  }

  public addReadOnlyIndex2(name: string, index: Index2): void
  {
    this.addReadOnlyStrings(name, index.i.toString(), index.j.toString());
  }

  public addReadOnlyIndex3(name: string, index: Index3): void
  {
    this.addReadOnlyStrings(name, index.i.toString(), index.j.toString(), index.k.toString());
  }

  public addReadOnlyVector2(name: string, vector: Vector3, fractionDigits = FractionDigitsDefault): void
  {
    this.addReadOnlyStrings(name, vector.x.toFixed(fractionDigits), vector.y.toFixed(fractionDigits));
  }

  public addReadOnlyVector3(name: string, vector: Vector3, fractionDigits = FractionDigitsDefault): void
  {
    this.addReadOnlyStrings(name, vector.x.toFixed(fractionDigits), vector.y.toFixed(fractionDigits), vector.z.toFixed(fractionDigits));
  }

  public addReadOnlyXY(name: string, x: number, y: number, fractionDigits = FractionDigitsDefault): void
  {
    this.addReadOnlyStrings(name, x.toFixed(fractionDigits), y.toFixed(fractionDigits));
  }

  public addReadOnlyStrings(name: string, ...args: string[]): void
  {
    this.addStringGroupProperty(name, args, true);
  }
}
