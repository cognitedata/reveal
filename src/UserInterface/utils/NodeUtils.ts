import isObject from 'lodash/isObject';

import { BaseNode } from "@/Core/Nodes/BaseNode";
import { UniqueId } from "@/Core/Primitives/UniqueId";
import { BasePropertyFolder } from "@/Core/Property/Base/BasePropertyFolder";
import { BaseProperty } from "@/Core/Property/Base/BaseProperty";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import { ColorMapProperty } from "@/Core/Property/Concrete/Property/ColorMapProperty";
import { ValueProperty, ExpandedOption } from "@/Core/Property/Base/ValueProperty";
import { ExpanderProperty } from "@/Core/Property/Concrete/Folder/ExpanderProperty";
import { GroupProperty } from "@/Core/Property/Concrete/Folder/GroupProperty";
import { ElementTypes } from "@/UserInterface/Components/Settings/ElementTypes";
import { ISettingsSection, ISettingsElement, ISelectOption } from "@/UserInterface/Components/Settings/Types";
import { StringProperty } from "@/Core/Property/Concrete/Property/StringProperty";
import { ColorProperty } from "@/Core/Property/Concrete/Property/ColorProperty";
import { SliderProperty } from "@/Core/Property/Concrete/Property/SliderProperty";
import { BooleanProperty } from "@/Core/Property/Concrete/Property/BooleanProperty";
import { NumberProperty } from "@/Core/Property/Concrete/Property/NumberProperty";
import { BaseCommand } from "@/Core/Commands/BaseCommand";
import { ColorTypeProperty } from "@/Core/Property/Concrete/Property/ColorTypeProperty";

export class NodeUtils {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  private static _currentProperties: BasePropertyFolder | null = null;

  private static _renderStyleCommands: BaseCommand[] | null = null;

  //= =================================================
  // STATIC PROPERTIES
  //= =================================================

  public static get renderStyleCommands(): BaseCommand[] | null {
    return NodeUtils._renderStyleCommands;
  }

  public static get properties(): BasePropertyFolder | null {
    return NodeUtils._currentProperties;
  }

  public static set properties(properties: BasePropertyFolder | null) {
    if (NodeUtils._currentProperties)
      NodeUtils._currentProperties.clearDelegates();
    NodeUtils._currentProperties = properties;
  }

  //= =================================================
  // STATIC METHODS: Getters
  //= =================================================

  public static getTreeRoot(): BaseNode | null {
    if (BaseRootNode.active)
      return BaseRootNode.active;
    return null;
  }

  public static getNodeById(id: string): BaseNode | null {
    if (BaseRootNode.active)
      return BaseRootNode.active.getDescendantByUniqueId(UniqueId.create(id));
    return null;
  }

  public static getPropertyById(name: string): BaseProperty | null {
    if (NodeUtils.properties)
      return NodeUtils.properties.getDescendantByName(name);
    return null;
  }

  //= =================================================
  // STATIC METHODS: Create element
  //= =================================================

  public static createRenderStyleCommands(baseNode: BaseNode) {
    NodeUtils._renderStyleCommands = baseNode.createRenderStyleCommands();
  }

  public static createElementTree(property: BaseProperty | null): ISettingsSection | ISettingsElement | null {
    if (!property)
      return null;

    // ***** GroupProperty
    if (property instanceof GroupProperty) {
      const parentElement = NodeUtils.createGroupElement(property);
      for (const childProperty of property.children) {
        const childElement = NodeUtils.createControlElement(childProperty);
        if (childElement)
          parentElement.subValues?.push(childElement);
      }
      return parentElement;
    }
    // ***** ExpanderProperty
    if (property instanceof ExpanderProperty) {
      const parentElement = NodeUtils.createExpanderElement(property);
      for (const childProperty of property.children) {
        const childElement = NodeUtils.createElementTree(childProperty) as ISettingsElement;
        if (childElement)
          parentElement.elements.push(childElement);
      }
      return parentElement;
    }
    // ***** ValueProperty
    if (property instanceof ValueProperty) {
      return NodeUtils.createControlElement(property);
    }
    return null;
  }

  private static createExpanderElement(property: ExpanderProperty): ISettingsSection {
    const element: ISettingsSection = {
      id: property.name,
      name: property.displayName,
      elements: [],
    };
    if (NodeUtils.renderStyleCommands && property.showToolbar)
      element.toolBar = NodeUtils.renderStyleCommands;
    return element;
  }

  private static createGroupElement(property: GroupProperty): ISettingsElement {
    const element: ISettingsElement = {
      id: property.name,
      name: property.displayName,
      type: ElementTypes.Group,
      toolTip: property.toolTip,
      subValues: [],
      isReadOnly: property.isReadOnly,
      useProperty: true,
      isOptional: false,
    };
    return element;
  }

  private static createControlElement(property: BaseProperty): ISettingsElement | null {
    if (!(property instanceof ValueProperty))
      return null;

    if (!property.isEnabled)
      return null;

    const type = NodeUtils.getControlType(property);
    if (!type)
      return null;

    const element: ISettingsElement = {
      id: property.name,
      name: property.displayName,
      type,
      toolTip: property.toolTip,
      value: property.value,
      subValues: [],
      isReadOnly: property.isReadOnly,
      useProperty: property.use,
      isOptional: property.isOptional,
      options: NodeUtils.createSelectOptions(property.getExpandedOptions(), property.getOptionIcon),
      extraOptionsData: property.extraOptionsData() || undefined,
    };

    return element;
  }

  private static createSelectOptions(options: any[] | [string, any][], iconDelegate?: Function): ISelectOption[] {
    const items: ISelectOption[] = [];
    if (options && options.length > 0) {
      for (const option of options) {
        if (isObject(option)) {
          items.push({
            label: option[ExpandedOption.Label],
            value: option[ExpandedOption.Value],
            iconSrc: iconDelegate && iconDelegate(option[ExpandedOption.Value])
          });
        } else {
          items.push({
            label: `${option}`,
            value: option
          });
        }
      }
    }
    return items;
  }

  private static getControlType(property: ValueProperty<any>): string | null {
    // Special properties comes first
    if (property instanceof BooleanProperty)
      return ElementTypes.Boolean;
    if (property instanceof SliderProperty)
      return ElementTypes.Slider;
    if (property instanceof ColorProperty)
      return ElementTypes.Color;
    if (property instanceof ColorMapProperty)
      return ElementTypes.ColorMap;
    if (property instanceof ColorTypeProperty)
      return ElementTypes.ColorType;

    // All others with options
    if (property.hasOptions) return ElementTypes.Select;

    // All without options
    if (property instanceof StringProperty)
      return ElementTypes.String;
    if (property instanceof NumberProperty)
      return ElementTypes.Number;

    console.error("property is not supported", property);
    return null;
  }
}
