import { BaseNode } from "@/Core/Nodes/BaseNode";
import { UniqueId } from "@/Core/Primitives/UniqueId";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import BaseProperty from "@/Core/Property/Base/BaseProperty";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import { PropertyType } from "@/Core/Enums/PropertyType";
import ColorMapProperty from "@/Core/Property/Concrete/Property/ColorMapProperty";
import { Appearance } from "@/Core/States/Appearance";
import UseProperty from "@/Core/Property/Base/UseProperty";
import ExpanderProperty from "@/Core/Property/Concrete/Folder/ExpanderProperty";
import GroupProperty from "@/Core/Property/Concrete/Folder/GroupProperty";
import ElementTypes from "@/UserInterface/Components/Settings/ElementTypes";
import { ISettingsSection, ISettingsElement, ISelectOption } from "@/UserInterface/Components/Settings/Types";

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
          if (subProperty instanceof UseProperty) 
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
    if (property instanceof UseProperty)
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
        options: NodeUtils.createSelectOptions(property.options, property.optionIconDelegate),
        useProperty: property.use,
        isOptional: property.isOptional,
      };

      // Handle seperate property types
      switch (property.getType())
      {
        case PropertyType.ColorMap: {
          element.options = property.options;
          element.colorMapOptions = (property as ColorMapProperty).getColorMapOptionColors(Appearance.valuesPerColorMap);
          return element;
        }
        default: {
          return element;
        }
      }
    }
    return null;
  }

  private static createSelectOptions(options, iconDelegate): ISelectOption[] 
  {
    const items: ISelectOption[] = [];
    if (options && options.length > 0)
    {
      for (const option of options)
      {
        items.push({
          label: option,
          value: option,
          iconSrc: iconDelegate && iconDelegate(option)
        });
      }
    }
    return items;
  }

  private static getControlType(property: BaseProperty): string 
  {
    const type = property.getType();
    if (type === PropertyType.String)
      return ElementTypes.String;

    if (type === PropertyType.Color)
      return ElementTypes.Color;

    if (type === PropertyType.ColorMap)
      return ElementTypes.ColorMap;

    if (type === PropertyType.Group)
      return ElementTypes.Group;

    if (type === PropertyType.Expander)
      return ElementTypes.Expander;

    if (type === PropertyType.Select)
      return ElementTypes.Select;

    if (type === PropertyType.Range)
      return ElementTypes.Range;

    return "";
  }
}
