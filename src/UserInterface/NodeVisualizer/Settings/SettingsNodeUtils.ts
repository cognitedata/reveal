import { NodeUtils } from "@/UserInterface/utils/NodeUtils";
import { ValueProperty } from "@/Core/Property/Base/ValueProperty";
import { ExpanderProperty } from "@/Core/Property/Concrete/Folder/ExpanderProperty";
import { Appearance } from "@/Core/States/Appearance";
import { BaseNode } from "@/Core/Nodes/BaseNode";

export class SettingsNodeUtils
{
  public static setPropertyValue<T>(id: string, value: T): void
  {
    const property = NodeUtils.getPropertyById(id);

    if (property)
    {
      (property as ValueProperty<T>).value = value;
    }
    else
    {
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
      console.log("Couldn't find property!");
    }
  }

  public static setPropertyUse(id: string, useProperty: boolean): void
  {
    const property = NodeUtils.getPropertyById(id);

    if (property instanceof ValueProperty)
    {
      property.use = useProperty;
    }
    else
    {
      console.log("Couldn't find property!", id);
    }
  }

  public static populateSettingsFolder(node: BaseNode): void
  {
    NodeUtils.properties = null;
    const settings = new ExpanderProperty("Settings");
    {
      const expander = settings.createExpander(Appearance.generalSettingsName);
      node.populateInfo(expander);
    }
    {
      const expander = settings.createExpander(Appearance.statisticsName);
      node.populateStatistics(expander);
    }
    {
      const expander = settings.createExpanderWithToolbar(Appearance.visualSettingsName);
      node.populateRenderStyle(expander);
    }
    NodeUtils.properties = settings;
  }
}
