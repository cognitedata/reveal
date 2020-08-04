import { PropertyType } from "@/Core/Enums/PropertyType";
import { BaseProperty } from "./BaseProperty";

abstract class Property extends BaseProperty
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  protected readonly _instance: any | undefined; //TODO: can we get rid of any here?
  protected _type: PropertyType = PropertyType.Default;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(name: string, readonly?: boolean, instance?: any)
  {
    super(name || "", readonly);
    this._instance = instance;
  }

  //==================================================
  // OVERRIDES of BaseProperty
  //==================================================

  public getType(): PropertyType { return this._type; }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public useComboBox = () => false;

  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected hasValueInMemory(): boolean { return this._instance === undefined; };

  protected apply(fieldName?: string): void
  {
    const applyDelegate = this.getApplyDelegate();
    if (!this.hasValueInMemory())
      applyDelegate?.call(this._instance);
  }
}

export default Property;
