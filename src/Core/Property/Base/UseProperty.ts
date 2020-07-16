import Property from "./Property";

abstract class UseProperty extends Property
{
  protected constructor(name: string, instance?: any, readonly?: boolean)
  {
    super(name, instance, readonly);
  }
}

export default UseProperty;

