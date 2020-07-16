import { Action, Retrieve } from "@/Core/Property/Base/BaseProperty";
import StringProperty from "@/Core/Property/Concrete/Property/StringProperty";
import BasePropertyFolder from "../../Base/BasePropertyFolder";
import ColorProperty from "@/Core/Property/Concrete/Property/ColorProperty";
import Color from "color";

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
}
