import Color from "color";
import Index3 from "@/Core/Geometry/Index3";
import Index2 from "@/Core/Geometry/Index2";
import Range1 from "@/Core/Geometry/Range1";
import Range3 from "@/Core/Geometry/Range3";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Statistics } from "@/Core/Geometry/Statistics";
import StringProperty from "@/Core/Property/Concrete/Property/StringProperty";
import ColorProperty from "@/Core/Property/Concrete/Property/ColorProperty";
import ColorMapProperty from "@/Core/Property/Concrete/Property/ColorMapProperty";
import { ColorMaps } from "@/Core/Primitives/ColorMaps";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";
import { Ma } from "@/Core/Primitives/Ma";
import { ColorType } from "@/Core/Enums/ColorType";
import BaseProperty from "@/Core/Property/Base/BaseProperty";
import { SliderProperty } from "@/Core/Property/Concrete/Property/SliderProperty";
import { NumberProperty } from "@/Core/Property/Concrete/Property/NumberProperty";
import { ColorTypeProperty } from "@/Core/Property/Concrete/Property/ColorTypeProperty";
import BooleanProperty from "@/Core/Property/Concrete/Property/BooleanProperty";
import { Util } from "@/Core/Primitives/Util";

const FractionDigitsDefault = 2;

export default abstract class BasePropertyFolder extends BaseProperty
{
  //==================================================
  // INSTANCE MEMBERS
  //==================================================

  private _children: BaseProperty[] = [];

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get children(): BaseProperty[] { return this._children; }

  //==================================================
  // CONSTRUCTOR
  //==================================================

  protected constructor(name: string) { super(name, false); }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public /*override*/ clearDelegates(): void
  {
    for (const child of this.children)
      child.clearDelegates();
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /*virtual*/ createGroup(name: string): BasePropertyFolder { throw Error("Cannot make a group here"); }
  public /*virtual*/ createExpander(name: string): BasePropertyFolder { throw Error("Cannot make a folder here"); }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getChildByName(name: string): BaseProperty | null
  {
    for (const child of this.children)
      if (child.name === name)
        return child;
    return null;
  }

  public getDescendantByName(name: string): BaseProperty | null
  {
    for (const child of this.children)
    {
      if (child.name === name)
        return child;

      if (child instanceof BasePropertyFolder)
      {
        const descendant = child.getDescendantByName(name);
        if (descendant != null)
          return descendant;
      }
    }
    return null;
  }

  public addChild(property: BaseProperty): void
  {
    this._children.push(property);
  }

  //==================================================
  // INSTANCE METHODS: Add specific properties
  //==================================================

  public addBoolean(params: IPropertyParams<boolean>): void { this.addChild(new BooleanProperty(params)); }
  public addNumber(params: IPropertyParams<number>): void { this.addChild(new NumberProperty(params)); }
  public addSlider(params: IPropertyParams<number>) { this.addChild(new SliderProperty(params)); }
  public addString(params: IPropertyParams<string>): void { this.addChild(new StringProperty(params)); }
  public addColor(params: IPropertyParams<Color>): void { this.addChild(new ColorProperty(params)); }
  public addColorType(params: IPropertyParams<ColorType>): void { this.addChild(new ColorTypeProperty(params)); }

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

  public addReadOnlyStatistics(name: string | null, statistics: Statistics | undefined, fractionDigits = FractionDigitsDefault): void
  {
    if (!statistics || statistics.isEmpty)
      return;

    let header = "Mean/StdDev";
    if (!Util.isEmpty(name))
      header = `${name}[${header}]`;

    this.addReadOnlyStrings(header, statistics.mean.toFixed(fractionDigits), statistics.stdDev.toFixed(fractionDigits));
  }

  public addReadOnlyRange1(name: string | null, range: Range1 | undefined, fractionDigits = FractionDigitsDefault): void
  {
    if (!range || range.isEmpty)
      return;

    let header = "Min/Delta/Max";
    if (!Util.isEmpty(name))
      header = `${name}[${header}]`;
    this.addReadOnlyStrings(header, range.min.toFixed(fractionDigits), range.delta.toFixed(fractionDigits), range.max.toFixed(fractionDigits));
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
    const property = this.createGroup(name);
    for (const [index, value] of args.entries())
      property.addChild(new StringProperty({ name: name + index, value, readonly: true }));
  }

}
