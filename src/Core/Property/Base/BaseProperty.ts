import { PropertyType } from "@/Core/Enums/PropertyType";

export type Action<T> = (value: T) => void;
export type Retrieve<T> = () => T;

export default abstract class BaseProperty
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _toolTip?: string;
  private _name: string;
  private _readonly = false;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get name(): string { return this._name; }
  public set name(value: string) { this._name = value; }
  public get toolTip(): string | undefined { return this._toolTip; }
  public set toolTip(value) { this._toolTip = value; }
  public get displayName(): string { return this.name == null ? "" : this.name; }
  public get isReadOnly(): boolean { return this._readonly; }
  public set isReadOnly(value: boolean) { this._readonly = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(name: string, readonly: boolean = false)
  {
    this._name = name;
    this._readonly = readonly;
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public abstract getType(): PropertyType;
}
