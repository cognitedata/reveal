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
    nodeProp: BasePropertyFolder | BaseProperty | null
  ): ISettingsSection | ISettingsElement | null
  {
    if (!nodeProp)
      return null;
  
    // If node is a GroupProperty
    if (nodeProp instanceof GroupProperty)
    {
      const element: ISettingsElement = {
        name: nodeProp.name,
        type: NodeUtils.mapToInputTypes(nodeProp.getType()),
        subValues: [],
        isReadOnly: nodeProp.isReadOnly,
        useProperty: true,
        isOptional: false,
      };
      if (nodeProp.children?.length > 0) 
      {
        nodeProp.children.forEach((subVal) => 
        {
          if (subVal instanceof UseProperty) 
          {
            const subElement: ISettingsElement = {
              name: subVal.name,
              isReadOnly: subVal.isReadOnly,
              type: NodeUtils.mapToInputTypes(subVal.getType()),
              value: subVal.value,
              useProperty: subVal.isValueEnabled,
              isOptional: subVal.isOptional
            };
              element?.subValues?.push(subElement);
          }
        });   
      }
      return element;
    }
  
    // If the node is PropertyFolder  
    if (nodeProp instanceof BasePropertyFolder)
    {
      const property = <ExpanderProperty>nodeProp;
      const section: ISettingsSection = {
        name: property.name,
        elements: [],
      };
      if (property.children?.length > 0) 
      {
        property.children.forEach((child) => 
        {
          section.elements.push(NodeUtils.generatePropertyTree(child) as ISettingsElement);
        });   
        return section;
      } 
      return section;
    }

    // If the node is Property 
    if (nodeProp instanceof UseProperty)
    {
      if (!nodeProp.isEnabled)
        return null;

      const element: ISettingsElement = {
        name: nodeProp.name,
        type: NodeUtils.mapToInputTypes(nodeProp.getType()),
        value: nodeProp.value,
        subValues: [],
        isReadOnly: nodeProp.isReadOnly,
        options: NodeUtils.createSelectOptions(nodeProp.options, nodeProp.optionIconDelegate),
        useProperty: nodeProp.use,
        isOptional: nodeProp.isOptional,
      };
      
      // Handle seperate property types
      switch (nodeProp.getType())
      {  
        case PropertyType.ColorMap: {
          element.colorMapOptions = (nodeProp as ColorMapProperty).getColorMapOptionColors(Appearance.valuesPerColorMap);
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
  
  private static mapToInputTypes(type: PropertyType): string 
  {
    if (type === PropertyType.String)
      return ElementTypes.INPUT;

    if (type === PropertyType.Color)
      return ElementTypes.COLOR_TABLE;

    if (type === PropertyType.ColorMap)
      return ElementTypes.COLORMAP_SELECT;

    if (type === PropertyType.Group)
      return ElementTypes.INPUT_GROUP;

    if (type === PropertyType.Expander)
      return ElementTypes.SECTION;
      
    if (type === PropertyType.Select)
      return ElementTypes.SELECT;

    if (type === PropertyType.Range)
      return ElementTypes.RANGE;

    return "";
  }
}
