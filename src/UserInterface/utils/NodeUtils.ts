import { BaseNode } from "@/Core/Nodes/BaseNode";
import { UniqueId } from "@/Core/Primitives/UniqueId";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import BaseProperty from "@/Core/Property/Base/BaseProperty";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import ColorMapProperty from "@/Core/Property/Concrete/Property/ColorMapProperty";
import { Appearance } from "@/Core/States/Appearance";
import ValueProperty, { ExpandedOption } from "@/Core/Property/Base/ValueProperty";
import ExpanderProperty from "@/Core/Property/Concrete/Folder/ExpanderProperty";
import GroupProperty from "@/Core/Property/Concrete/Folder/GroupProperty";
import ElementTypes from "@/UserInterface/Components/Settings/ElementTypes";
import { ISettingsSection, ISettingsElement, ISelectOption } from "@/UserInterface/Components/Settings/Types";
import StringProperty from "@/Core/Property/Concrete/Property/StringProperty";
import ColorProperty from "@/Core/Property/Concrete/Property/ColorProperty";
import { SliderProperty } from "@/Core/Property/Concrete/Property/SliderProperty";
import BooleanProperty from "@/Core/Property/Concrete/Property/BooleanProperty";
import { NumberProperty } from "@/Core/Property/Concrete/Property/NumberProperty";

export default class NodeUtils
{

  private static _currentProperties: BasePropertyFolder | null = null;

  public static get properties(): BasePropertyFolder | null
  {
    return NodeUtils._currentProperties;
  }

  public static set properties(properties: BasePropertyFolder | null)
  {
    NodeUtils._currentProperties = properties;
  }

  public static getTreeRoot(): BaseNode | null
  {
    if (BaseRootNode.active)
      return BaseRootNode.active;
    return null;
  }

  public static getNodeById(id: string): BaseNode | null
  {
    if (BaseRootNode.active)
      return BaseRootNode.active.getDescendantByUniqueId(UniqueId.create(id));
    return null;
  }

  public static getPropertyById(name: string): BaseProperty | null 
  {
    if (NodeUtils.properties)
      return NodeUtils.properties.getDescendantByName(name);
    return null;
  }

  public static generatePropertyTree(
    property: BasePropertyFolder | BaseProperty | null
  ): ISettingsSection | ISettingsElement | null
  {
    if (!property)
      return null;

    // If node is a GroupProperty
    if (property instanceof GroupProperty)
    {
      const element: ISettingsElement = {
        id: property.name,
        name: property.displayName,
        type: NodeUtils.getControlType(property),
        subValues: [],
        isReadOnly: property.isReadOnly,
        useProperty: true,
        isOptional: false,
      };
      if (property.children?.length > 0) 
      {
        property.children.forEach((subProperty) => 
        {
          if (subProperty instanceof ValueProperty) 
          {
            const subElement: ISettingsElement = {
              id: property.name,
              name: subProperty.displayName,
              isReadOnly: subProperty.isReadOnly,
              type: NodeUtils.getControlType(subProperty),
              value: subProperty.value,
              useProperty: subProperty.isValueEnabled,
              isOptional: subProperty.isOptional
            };
            element?.subValues?.push(subElement);
          }
        });
      }
      return element;
    }

    // If the node is PropertyFolder  
    if (property instanceof BasePropertyFolder)
    {
      const expander = <ExpanderProperty>property;
      const section: ISettingsSection = {
        id: expander.name,
        name: expander.displayName,
        elements: [],
      };
      if (expander.children?.length > 0) 
      {
        expander.children.forEach((child) => 
        {
          section.elements.push(NodeUtils.generatePropertyTree(child) as ISettingsElement);
        });
        return section;
      }
      return section;
    }

    // If the node is Property 
    if (property instanceof ValueProperty)
    {
      if (!property.isEnabled)
        return null;

      const element: ISettingsElement = {
        id: property.name,
        name: property.displayName,
        type: NodeUtils.getControlType(property),
        value: property.value,
        subValues: [],
        isReadOnly: property.isReadOnly,
        options: NodeUtils.createSelectOptions(property.getExpandedOptions(), property.getOptionIcon),
        useProperty: property.use,
        isOptional: property.isOptional,
      };

      // Handle seperate property types
      if (property instanceof ColorMapProperty)
      {
        element.options = property.options as string[];
        element.colorMapOptions = (property as ColorMapProperty).getColorMapOptionColors(Appearance.valuesPerColorMap);
      }
      return element;
    }
    return null;
  }

  private static createSelectOptions(options: any[] | [string, any][], iconDelegate: Function ): ISelectOption[]
  {
    const items: ISelectOption[] = [];
    if (options && options.length > 0)
    {
      for (const option of options)
      {
        if (typeof option === "object")
        {
          items.push({
            label: option[ExpandedOption.label],
            value: option[ExpandedOption.value],
            iconSrc: iconDelegate && iconDelegate(option[ExpandedOption.value])
          });
        }
        else 
        {
          items.push({
            label: `${option}`,
            value: option
          });
        }
      }
    }
    return items;
  }

  private static getControlType(property: BaseProperty): string 
  {
    // Special properties comes first
    if (property instanceof BooleanProperty)
      return ElementTypes.Boolean;
    if (property instanceof SliderProperty)
      return ElementTypes.Slider;
    if (property instanceof ColorProperty)
      return ElementTypes.Color;
    if (property instanceof ColorMapProperty)
      return ElementTypes.ColorMap;
    if (property instanceof ExpanderProperty)
      return ElementTypes.Expander;
    if (property instanceof GroupProperty)
      return ElementTypes.Group;

    // General properties
    if (property instanceof ValueProperty)
    {
      if (property.hasOptions)
        return ElementTypes.Select;
    }
    if (property instanceof StringProperty)
      return ElementTypes.String;
    if (property instanceof NumberProperty && !property.hasOptions)
      return ElementTypes.Number;

    console.error("property is not supported", property);
    return "";
  }
}
