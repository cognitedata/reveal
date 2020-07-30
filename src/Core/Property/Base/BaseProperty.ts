import { PropertyType } from "@/Core/Enums/PropertyType";

export type Action<T> = (value: T) => void;
export type Retrieve<T> = () => T;

export abstract class BaseProperty
{
  private _toolTip?: string;
  private _name: string;
  private _applyDelegate?: Action<void>;
  private _readonly = false;
  private _children?: BaseProperty[];

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(nameValue: string, readonly?: boolean)
  {
    this._name = nameValue;
    this._readonly = !!readonly;
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getName(): string { return this._name; }
  public setName(value: string) { this._name = value; }
  public isReadOnly(): boolean { return this._readonly; }
  public setReadOnly(value: boolean) { this._readonly = value; }
  public getToolTip(): string | undefined { return this._toolTip; }
  public setToolTip(value) { this._toolTip = value; }
  public get children(): BaseProperty[] { return this._children || []; }
  public abstract getType(): PropertyType;

  public addChild(property: BaseProperty): void
  {
    if (!this._children)
      this._children = [];

    this._children.push(property);
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /*virtual*/ displayName(): string { return this.getName() == null ? "" : this.getName(); }
  public /*virtual*/ getApplyDelegate(): Action<void> | undefined { return this._applyDelegate; }
  public /*virtual*/ setApplyDelegate(value) { this._applyDelegate = value; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getChildPropertyByName(name: string): BaseProperty | null
  {
    if (name === this.getName())
    {
      return this;
    }
    else
    {
      for (const child of this.children)
      {
        const childProperty = child.getChildPropertyByName(name);
        if (childProperty)
        {
          return childProperty;
        }
      }
      return null;
    }
  }
}
