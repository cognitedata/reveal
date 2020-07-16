import { MiddlewareAPI, Dispatch } from "redux";
import { SettingsCommandPayloadType, SettingsStateInterface } from "@/UserInterface/interfaces/settings";
import { ReduxStore } from "@/UserInterface/interfaces/common";
import { CHANGE_SELECT_STATE, ON_INPUT_CHANGE } from "../types/actionTypes";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";
import { onSelectedNodeChange } from "@/UserInterface/redux/actions/settings";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { IconTypes } from "@/UserInterface/constants/Icons";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import UsePropertyT from "@/Core/Property/Base/UsePropertyT";
import { PropertyType } from "@/Core/Enums/PropertyType";
import Inputs from "@/UserInterface/constants/Inputs";
// Settings middleware
export default (store: MiddlewareAPI) => (next: Dispatch) => (action: {
  type: string;
  appliesTo: string;
  payload: SettingsCommandPayloadType | boolean;
}) =>
{
  const { type, payload } = action;
  const state: ReduxStore = store.getState();
  const { explorer, settings } = state;
  switch (type)
  {
    case CHANGE_SELECT_STATE :
    {
      const uniqueId = action.appliesTo;
      const selectStatus = payload;
      const nodes = explorer.nodes;
      if (!nodes)
      {
        return;
      }
      const node = nodes[uniqueId!]?.domainObject;
      if (node)
      {
        if (!selectStatus)
        {
          const defaultSettingsState = generateSettingsState(node, null);
          store.dispatch(onSelectedNodeChange(defaultSettingsState));
        }
        else
        {
          const settingsProperties = new PropertyFolder("Settings");
          const generalProperties = new PropertyFolder("General Properties");
          node.populateGeneralProperties(generalProperties);
          settingsProperties.addChild(generalProperties);
          const settingsState = generateSettingsState(node, settingsProperties);
          store.dispatch(onSelectedNodeChange(settingsState));
        }
      }
      break;
    }
    case ON_INPUT_CHANGE:
    {
      const { elementIndex, subElementIndex, value } = action.payload as SettingsCommandPayloadType;
      if (elementIndex)
      {
        settings.elements[elementIndex].propertyObject.value = value;
      }
      else if (subElementIndex)
      {
        settings.subElements[subElementIndex].propertyObject.value = value;
      }
      next(action);
      break;
    }
    default:
      next(action);
  }
};

function generateSettingsState(node: BaseNode, propFolder: PropertyFolder | null): SettingsStateInterface
{
  const settingsState = {
    id: node.uniqueId.toString(),
    titleBar: {
      name: node.displayName,
      icon: { type: IconTypes.NODES, name: "WellNode" },
      toolBar: [
        {
          icon: { type: IconTypes.STATES, name: "Pinned" }
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatLeft" }
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatRight" }
        }
      ]
    },
    sections: {},
    subSections: {},
    elements: {},
    subElements: {}
  } as SettingsStateInterface;
  if (!propFolder)
  {
    return settingsState;
  }
  // loop sections
  for (let i = 0; i < propFolder.children.length; i++)
  {
    const childPropFolder = propFolder.children[i] as BasePropertyFolder;
    settingsState.sections[i.toString()] = {
      name: childPropFolder.getName(),
      isExpanded: childPropFolder.expanded,
      elementIds: []
    };
    // loop subsections or elements
    for (let j = 0; j < childPropFolder.children.length; j++)
    {
      const propsOrChildPropFolder = childPropFolder.children[j];
      if (propsOrChildPropFolder instanceof UsePropertyT)
      {
        const prop = propsOrChildPropFolder as UsePropertyT<any>;
        settingsState.elements[j.toString()] = {
          propertyObject: prop,
          label: prop.getName(),
          type: mapToInputTypes(prop.getType()),
          value: prop.value
        };
        settingsState.sections[i.toString()].elementIds.push(j.toString());
      }
    }
  }
  return settingsState;
}

function mapToInputTypes(type: PropertyType): string
{
  if (type === PropertyType.String)
    return Inputs.INPUT;
  else if (type === PropertyType.Color)
    return Inputs.COLOR_TABLE;
  return "";
}

