import * as Lodash from "lodash";
import BaseProperty from "@/Core/Property/Base/BaseProperty";
import IPropertyParams from "@/Core/Property/Base/IPropertyParams";

//==================================================
// TYPES AND DELEGATES
//==================================================

export type StringAction = (name: string) => void;
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
  private _extraOptionData?: string[][];
  private _use?: boolean; // undefined = hide the use button

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get isValueEnabled(): boolean { return this.use && this.isEnabled; }
  public get isEnabled(): boolean { return this._isEnabledDelegate === undefined || this._isEnabledDelegate(); }
  public get hasOptions(): boolean { return this._options !== undefined; }
  public get options(): T | T[] | undefined { return this._options; }
  public set options(value: T | T[] | undefined) { this._options = value; }
  public get useName(): string { return `use${this.name.charAt(0).toUpperCase()}${this.name.substring(1)}`; }
  public get isOptional(): boolean { return this._use !== undefined; }
  public get extraOptionsData(): string[][] | undefined { return this._extraOptionData; };
  public set extraOptionsData(extraOptionsData: string[][] | undefined) { this._extraOptionData = extraOptionsData; };

  //==================================================
  // INSTANCE DELEGATES
  //==================================================

  private _applyDelegate?: StringAction;
  private _isEnabledDelegate?: IsEnabled;
  private _optionValidationDelegate?: ValidateOption

  public get applyDelegate(): StringAction | undefined { return this._applyDelegate; }
  public set applyDelegate(value: StringAction | undefined) { this._applyDelegate = value; }
  public get isEnabledDelegate(): IsEnabled | undefined { return this._isEnabledDelegate; }
  public set isEnabledDelegate(value: IsEnabled | undefined) { this._isEnabledDelegate = value; }
  public get optionValidationDelegate(): ValidateOption | undefined { return this._optionValidationDelegate; }
  public set optionValidationDelegate(value: ValidateOption | undefined) { this._optionValidationDelegate = value; }

  //==================================================
  // CONSTRUCTOR
  //==================================================

  protected constructor(params: IPropertyParams<T>)
  {
    super(params.name, params.readonly, params.toolTip);

    this._applyDelegate = params.applyDelegate;
    this._isEnabledDelegate = params.isEnabledDelegate;
    this._optionValidationDelegate = params.optionValidationDelegate;

    this._options = params.options as T | T[];

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
  // OVERRIDES of BaseProperty
  //==================================================

  public /*override*/ clearDelegates(): void
  {
    this._applyDelegate = undefined;
    this._isEnabledDelegate = undefined;
    this._optionValidationDelegate = undefined;
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

  private apply(): void
  {
    if (this._applyDelegate)
      this._applyDelegate(this.name);
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
        const optionsTuple: [K, T[K]][] = [];
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

  public /*virtual*/ getOptionIcon(option: T): string { return ""; }
}
