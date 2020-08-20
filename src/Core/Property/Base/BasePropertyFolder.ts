import StringProperty from "@/Core/Property/Concrete/Property/StringProperty";
import ColorProperty from "@/Core/Property/Concrete/Property/ColorProperty";
import ColorMapProperty from "@/Core/Property/Concrete/Property/ColorMapProperty";
import Color from "color";
import { ColorMaps } from "@/Core/Primitives/ColorMaps";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";
import { Ma } from "@/Core/Primitives/Ma";
import BaseProperty from "./BaseProperty";

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
  // CONSTRUCTORS
  //==================================================

  protected constructor(name: string) { super(name, false); }

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
  // INSTANCE METHODS: Add variables
  //==================================================

  public addString(params: IPropertyParams<string>): void { this.addChild(new StringProperty(params)); }
  public addColor(params: IPropertyParams<Color>): void { this.addChild(new ColorProperty(params)); }

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
}
