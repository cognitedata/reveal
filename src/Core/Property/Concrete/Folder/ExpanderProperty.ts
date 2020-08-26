import GroupProperty from "@/Core/Property/Concrete/Folder/GroupProperty";
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
  // OVERRIDES of BasePropertyFolder
  //==================================================

  createGroup(name: string): BasePropertyFolder
  {
    const folder = new GroupProperty(name);
    this.addChild(folder);
    return folder;
  }

  createExpander(name: string): BasePropertyFolder
  {
    const folder = new ExpanderProperty(name);
    this.addChild(folder);
    return folder;
  }
}
