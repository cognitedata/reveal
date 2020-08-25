import * as Lodash from "lodash";
import { PropertyType } from "@/Core/Enums/PropertyType";

export default abstract class BaseProperty
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _name: string;
  private _displayName: string;
  private _toolTip?: string;
  private _readonly: boolean;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get name(): string { return this._name; }
  public set name(value: string) { this._name = value; }
  public get displayName(): string { return this._displayName ? this._displayName : this.name; }
  public set displayName(value: string) { this._displayName = value; }
  public get isReadOnly(): boolean { return this._readonly; }
  public set isReadOnly(value: boolean) { this._readonly = value; }
  public get toolTip(): string | undefined { return this._toolTip; }
  public set toolTip(value) { this._toolTip = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(name: string, readonly?: boolean, toolTip?: string)
  {
    this._name = name;
    this._displayName = this.name.charAt(0).toUpperCase() + Lodash.startCase(this.name).substring(1).toLowerCase();
    this._toolTip = toolTip;
    this._readonly = readonly === undefined ? false : readonly;
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public abstract getType(): PropertyType;
}
