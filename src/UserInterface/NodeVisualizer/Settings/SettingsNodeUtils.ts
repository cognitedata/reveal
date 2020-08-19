import NodeUtils from "@/UserInterface/utils/NodeUtils";
import UseProperty from "@/Core/Property/Base/UseProperty";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { ExpanderProperty } from '@/Core/Property/Concrete/Folder/ExpanderProperty';
import { isInstanceOf } from '@/Core/Primitives/ClassT';

export default class SettingsNodeUtils
{
  public static setPropertyValue<T>(id: string, value: T): void
  {
    const property = NodeUtils.getPropertyById(id);

    if (property)
    {
      (property as UseProperty<T>).value = value;
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

    if (property instanceof ExpanderProperty)
      property.expanded = expand;
    else
    {
      // tslint:disable-next-line:no-console
      console.log("Couldn't find property!");
    }
  }

}
