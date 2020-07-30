import NodeUtils from "@/UserInterface/utils/NodeUtils";
import UsePropertyT from "@/Core/Property/Base/UsePropertyT";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";

export default class SettingsNodeUtils
{
  public static setPropertyValue<T>(id: string, value: T): void
  {
    const property = NodeUtils.getPropertyById(id);
    if (property)
    {
      (property as UsePropertyT<T>).value = value;
    }
    else
    {
      // tslint:disable-next-line:no-console
      console.log("Couldn't find property!");
    }
  }

  public static setPropertyFolderExpand(id: string, expand: boolean): void
  {
    const property = NodeUtils.getPropertyById(id);
    if (property)
    {
      (property as BasePropertyFolder).expanded = expand;
    }
    else
    {
      // tslint:disable-next-line:no-console
      console.log("Couldn't find property!");
    }
  }

}
