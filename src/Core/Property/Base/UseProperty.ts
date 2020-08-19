import BaseProperty from '@/Core/Property/Base/BaseProperty';
import { Action, Retrieve } from "./BaseProperty";

export default abstract class UseProperty<T> extends BaseProperty
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  protected readonly _instance: any | undefined;
  protected _value: T | Retrieve<T>;
  protected _valueDelegate?: Action<T>;
  protected _legalValues: T[] = [];
  private _applyDelegate?: Action<void>;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get applyDelegate(): Action<void> | undefined { return this._applyDelegate; }
  public set applyDelegate(value: Action<void> | undefined) { this._applyDelegate = value; }
  public get hasLegalValues(): boolean { return this._legalValues.length > 0; }
  public get legalValues(): T[] { return this._legalValues; }
  public set legalValues(values: T[]) { this._legalValues = values; }
  protected get hasValueInMemory(): boolean { return this._instance === undefined; };

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(name: string, value: T | Retrieve<T>, readonly?: boolean, instance?: any, applyDelegate?: Action<void>, valueDelegate?: Action<T>, options?: T[])
  {
    super(name, readonly);
    this._value = value;
    this._valueDelegate = valueDelegate;
    this.applyDelegate = applyDelegate;
    if (options)
      this.legalValues = options;
    this._instance = instance;
  }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get value(): T
  {
    if (!this._instance)
      return this._value as T;
    return (this._value as Retrieve<T>).call(this._instance);
  }

  public set value(value: T)
  {
    if (this.isReadOnly)
      throw Error("Cannot set to a readonly property");

    const oldValue = this.value;
    if (oldValue !== undefined && oldValue === value)
      return;

    if (!this._instance)
      this._value = value as T;
    else
      this._valueDelegate?.call(this._instance, value);
    this.apply();
  }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public useComboBox = () => false;

  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected apply(fieldName?: string): void
  {
    this.applyDelegate?.call(this._instance);
  }
}
