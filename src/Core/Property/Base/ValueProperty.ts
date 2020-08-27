import * as Lodash from "lodash";
import BaseProperty from "@/Core/Property/Base/BaseProperty";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

//==================================================
// Delegates
//==================================================

export type Action = () => void;
export type StringAction = (fieldName: string) => void;
export type IsEnabled = () => boolean;
export type ValidateOption = (option: any) => boolean;
export enum ExpandedOption 
{
  label = 0,
  value,
}

export default abstract class ValueProperty<T> extends BaseProperty
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private readonly _instance?: object;
  private _value?: T;
  private _options?: T | T[];
  private _fieldName?: string;
  private _use?: boolean; // undefined = hide the use button

  private _apply?: Action;
  private _isEnabled?: IsEnabled;
  private _optionValidationDelegate?: ValidateOption
  private _applyByFieldNameDelegate?: StringAction;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get isValueEnabled(): boolean { return this.use && this.isEnabled; }
  public get isEnabled(): boolean { return this._isEnabled === undefined || this._isEnabled.call(this._instance); }
  public get hasOptions(): boolean { return this._options !== undefined; }
  public get options(): T | T[] | undefined { return this._options; }
  public set options(value: T | T[] | undefined) { this._options = value; }
  public get useName(): string { return `use${this.name.charAt(0).toUpperCase()}${this.name.substring(1)}`; }
  public get fieldName(): string | undefined { return this._fieldName; }
  public set fieldName(value: string | undefined) { this._fieldName = value; }
  public get isOptional(): boolean { return this._use !== undefined; }
  public get optionValidationDelegate(): ValidateOption | undefined { return this._optionValidationDelegate; }
  public set optionValidationDelegate(value: ValidateOption | undefined) { this._optionValidationDelegate = value; }
  public get applyByFieldNameDelegate(): StringAction | undefined { return this._applyByFieldNameDelegate; }
  public set applyByFieldNameDelegate(value: StringAction | undefined) { this._applyByFieldNameDelegate = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(params: IPropertyParams<T>)
  {
    super(params.name, params.readonly, params.toolTip);

    this._apply = params.apply;
    this._applyByFieldNameDelegate = params.applyByFieldNameDelegate;
    this._isEnabled = params.isEnabled;
    this._optionValidationDelegate = params.optionValidationDelegate;

    this._options = params.options as T | T[];
    this._fieldName = params.name;

    // Set the value
    if (params.instance)
    {
      if (params.value !== undefined)
        throw Error("Property has both value and instance");

      if (!Reflect.has(params.instance, this.name))
      {
        this.displayName = `NOT_FOUND ${this.name}`;
        return;
      }
      if (Reflect.has(params.instance, this.useName))
        this._use = true; // just set it either true or false

      this._instance = params.instance;
      this.displayName = this.name.charAt(0).toUpperCase() + Lodash.startCase(this.name).substring(1).toLowerCase();
    }
    else if (params.value !== undefined)
    {
      this._value = params.value;
      this._use = params.use;
    }
    else
      throw Error("Property has no value or instance");
  }

  //==================================================
  // INSTANCE PROPERTIES: Value setter and getter
  //==================================================

  public get value(): T
  {
    if (!this._instance)
      return this._value as T;
    return Reflect.get(this._instance, this.name) as T;
  }

  public set value(value: T)
  {
    if (this.isReadOnly)
      throw Error("Cannot set to a readonly property");

    if (this.value === value)
      return; // not changed

    if (!this._instance)
      this._value = value as T;
    else
      Reflect.set(this._instance, this.name, value);
    this.apply();
  }

  public get use(): boolean
  {
    if (this._use === undefined)
      return true;

    if (!this._instance)
      return this._use;

    return Reflect.get(this._instance, this.useName) as boolean;
  }

  public set use(value: boolean)
  {
    if (this.isReadOnly)
      throw Error("Cannot set use on a readonly property");

    if (this._use === undefined)
      throw Error("Cannot set use, it is not optional");

    if (this.use === value)
      return; // not changed

    if (!this._instance)
      this._use = value;
    else
      Reflect.set(this._instance, this.useName, value);
    this.apply();
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected apply(): void
  {
    if (this._instance && this._apply)
      this._apply.call(this._instance);

    if (this._applyByFieldNameDelegate && this.fieldName)
      this._applyByFieldNameDelegate(this.fieldName);
  }

  public getExpandedOptions<K extends keyof T>(): T[] | [K, T[K]][] | []
  {
    let opt: T[] | [K, T[K]][] = [];
    const validateOption = (val: T[K] | T): boolean => (this.optionValidationDelegate ? this.optionValidationDelegate(val) : true);

    if (this._options)
    {
      if ("length" in this._options)
        opt = this._options.filter(val => validateOption(val));
      else
      {
        const optionsTuple: [K, T[K]][]= [];
        for (const enumKey of Object.keys(this._options) as K[])
        {
          if (typeof this._options[enumKey] === "number") // get only the Enum Values from enum object
            optionsTuple.push([enumKey, this._options[enumKey]]);
        }
        opt = optionsTuple.filter(val => validateOption(val[ExpandedOption.value]));
      }
    }

    return opt;
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /** override **/ getOptionIcon(option: T): string { return ""; }
}
