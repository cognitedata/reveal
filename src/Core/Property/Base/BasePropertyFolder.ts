import { BaseProperty } from "./BaseProperty";
import { PropertyType } from "@/Core/Enums/PropertyType";

export default abstract class BasePropertyFolder extends BaseProperty
{
  private _expanded: boolean = true;
  protected _type: PropertyType = PropertyType.DefaultPropertyFolder;

  constructor(private name: string)
  {
    super(name);
  }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get expanded(): boolean { return this._expanded; }
  public set expanded(value: boolean) { this._expanded = value; }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return this._type; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getChildByType(type: BasePropertyFolder): void {}

  // public abstract Add(...args: (string | boolean | object)[]): void; todo: add this after correct concrete property class can be derived from  parameters
}
