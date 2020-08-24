import GroupProperty from "@/Core/Property/Concrete/Folder/GroupProperty";
import Index3 from "@/Core/Geometry/Index3";
import Index2 from "@/Core/Geometry/Index2";
import Range1 from "@/Core/Geometry/Range1";
import Range3 from "@/Core/Geometry/Range3";
import { Vector3 } from "@/Core/Geometry/Vector3";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { PropertyType } from "@/Core/Enums/PropertyType";
import { Statistics } from "@/Core/Geometry/Statistics";
import StringProperty from "@/Core/Property/Concrete/Property/StringProperty";
import ColorProperty from "@/Core/Property/Concrete/Property/ColorProperty";
import ColorMapProperty from "@/Core/Property/Concrete/Property/ColorMapProperty";
import Color from "color";
import { ColorMaps } from "@/Core/Primitives/ColorMaps";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";
import { Ma } from "@/Core/Primitives/Ma";
import { RangeProperty } from "@/Core/Property/Concrete/Property/RangeProperty";
import { SelectProperty } from "@/Core/Property/Concrete/Property/SelectProperty";

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
  // INSTANCE METHODS: Add variables
  //==================================================

  public addString(params: IPropertyParams<string>): void { this.addChild(new StringProperty(params)); }
  public addColor(params: IPropertyParams<Color>): void { this.addChild(new ColorProperty(params)); }
  public addRange(params: IPropertyParams<number>) { this.addChild(new RangeProperty(params)); }
  public addSelect(params: IPropertyParams<unknown>): void { this.addChild(new SelectProperty(params)); }

  public addColorMap(params: IPropertyParams<string>): void
  {
    params.options = ColorMaps.getOptions();
    this.addChild(new ColorMapProperty(params));
  }

  //==================================================
  // INSTANCE METHODS: Add readonly
  //==================================================

  public addReadOnlyString(name: string, value: string): void { this.addChild(new StringProperty({ name, value, readonly: true })); }
  public addReadOnlyInteger(name: string, value: number): void { this.addReadOnlyString(name, value.toString()); }
  public addReadOnlyNumber(name: string, value: number, fractionDigits = FractionDigitsDefault): void { this.addReadOnlyString(name, value.toFixed(fractionDigits)); }
  public addReadOnlyAngle(name: string, value: number): void { this.addReadOnlyString(name, `${Ma.toDeg(value).toFixed(2)} [degrees]`); }

  //==================================================
  // INSTANCE METHODS: Add read only values
  //==================================================

  public addReadOnlyStatistics(name: string, statistics: Statistics | undefined, fractionDigits = FractionDigitsDefault): void
  {
    if (statistics && !statistics.isEmpty)
      this.addReadOnlyStrings(`${name}[mean/StdDev]`, statistics.mean.toFixed(fractionDigits), statistics.stdDev.toFixed(fractionDigits));
  }

  public addReadOnlyRange1(name: string, range: Range1 | undefined, fractionDigits = FractionDigitsDefault): void
  {
    if (range && !range.isEmpty)
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
      property.addChild(new StringProperty({ name: name + index, value, readonly: true }));
    this.addChild(property);
  }
}
