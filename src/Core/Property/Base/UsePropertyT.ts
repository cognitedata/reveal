import { Action, Retrieve } from "./BaseProperty";
import Property from "@/Core/Property/Base/Property";

abstract class UsePropertyT<T> extends Property
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  protected _value: T | Retrieve<T>;
  protected _valueDelegate?: Action<T>;
  protected _legalValues: T[] = [];
  private _hasLegalValues: boolean = false;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(name: string, value: T | Retrieve<T>, readonly ?: boolean, instance?: any, applyDelegate?: Action<void>, valueDelegate?: Action<T>)
  {
    super(name, readonly, instance);
    this._value = value;
    this._valueDelegate = valueDelegate;
    this.setApplyDelegate(applyDelegate);
  }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get value(): T | undefined
  {
    if (this.hasValueInMemory())
      return this._value as T;
    else
      return this.getValueByDelegate() as T;
  }

  public set value(value: T | undefined)
  {
    if (this.isReadOnly())
    {
      // tslint:disable-next-line:no-console
      console.log("Cannot set to a readonly property", this);
      return;
    }

    if (this.hasValueInMemory())
    {
      if (this._value !== undefined && this._value === value)
        return;
      this._value = value as T;
    }
    else
    {
      const oldValue = this.getValueByDelegate() as T;
      if (oldValue !== undefined && oldValue === value)
        return;
      this.setValueByDelegate(value);
    }
    this.apply();
  }
  public get hasLegalValues(): boolean { return this._hasLegalValues; }
  public set hasLegalValues(value: boolean) { this._hasLegalValues = value; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected getValueByDelegate(): T | undefined
  {
    if (this._instance)
      return (this._value as Retrieve<T>).call(this._instance);
    else
      return this._value as T;
  }

  protected setValueByDelegate(value): void
  {
    if (this._instance)
      this._valueDelegate?.call(this._instance, value);
  }

  public getLegalValues(): T[] { return this._legalValues; }
  public setLegalValues(values: T[]): void
  {
    this._legalValues = values;
    this._hasLegalValues = !!(values && values.length);
  }
}

export default UsePropertyT;
