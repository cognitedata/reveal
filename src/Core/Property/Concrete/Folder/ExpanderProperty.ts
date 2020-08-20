import GroupProperty from "@/Core/Property/Concrete/Folder/GroupProperty";
import Index3 from "@/Core/Geometry/Index3";
import Index2 from "@/Core/Geometry/Index2";
import { Range1 } from "@/Core/Geometry/Range1";
import { Range3 } from "@/Core/Geometry/Range3";
import { Vector3 } from "@/Core/Geometry/Vector3";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { PropertyType } from "@/Core/Enums/PropertyType";

const FractionDigitsDefault = 2;

export default class ExpanderProperty extends BasePropertyFolder
{
  //==================================================
  // INSTANCE MEMBERS
  //==================================================

  private _expanded: boolean = true;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get expanded(): boolean { return this._expanded; }
  public set expanded(value: boolean) { this._expanded = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(name: string) { super(name); }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return PropertyType.Expander; }

  //==================================================
  // INSTANCE METHODS: Add read only values
  //==================================================

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
    const property = new GroupProperty(name);
    for (const [index, value] of args.entries())
      property.addReadOnlyString(name + index, value);
    this.addChild(property);
  }
}
