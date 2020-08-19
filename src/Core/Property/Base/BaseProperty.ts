import { PropertyType } from "@/Core/Enums/PropertyType";

export default abstract class BaseProperty
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _name: string;
  private _readonly: boolean;
  private _toolTip?: string;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get name(): string { return this._name; }
  public set name(value: string) { this._name = value; }
  public get displayName(): string { return this.name == null ? "" : this.name; }
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
    this._readonly = readonly === undefined ? false : readonly;
    this._toolTip = toolTip;
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public abstract getType(): PropertyType;
}
