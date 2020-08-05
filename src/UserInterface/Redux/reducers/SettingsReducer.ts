import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { PropertyType } from "@/Core/Enums/PropertyType";
import NodeUtils from "@/UserInterface/utils/NodeUtils";
import { BaseProperty } from "@/Core/Property/Base/BaseProperty";
import UsePropertyT from "@/Core/Property/Base/UsePropertyT";
import SettingsNodeUtils from "@/UserInterface/NodeVisualizer/Settings/SettingsNodeUtils";
import ElementTypes from "@/UserInterface/Components/Settings/ElementTypes";
import { IconTypes } from "@/UserInterface/Components/Icon/IconTypes";
import { ISettingsPropertyState, ISettingsState } from "@/UserInterface/Redux/State/settings";

// Initial settings state
const initialState = {
  currentNodeId: "",
  properties: {
    byId: {},
    allIds: []
  },
  titleBar: {
    name: "",
    icon: { type: IconTypes.NODES, name: "FolderNode" },
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
  }
} as ISettingsState;
// Redux Toolkit package includes a createReducer utility that uses Immer internally.
// Because of this, we can write reducers that appear to "mutate" state, but the updates
// are actually applied immutably.

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    onSelectedNodeChange: {
      reducer(state: ISettingsState, action: PayloadAction<{ node: BaseNode, propertyFolder: BasePropertyFolder }>)
      {
        const {node} = action.payload;
        const {propertyFolder} = action.payload;

        if (node && node.IsSelected())
        {
          state.currentNodeId = node.uniqueId.toString();
          state.titleBar.name = node.displayName;
        }
        else
        {
          state.currentNodeId = "";
          state.titleBar.name = "";
        }

        state.properties.byId = {};
        state.properties.allIds = [];

        if (propertyFolder && propertyFolder.children && propertyFolder.children.length)
        {
          const allPropertyStates = convertToSettingsState(propertyFolder.children);
          for (const property of allPropertyStates)
          {
            state.properties.byId[property.name] = property;
            state.properties.allIds.push(property.name);
          }
        }
      },
      prepare(node: BaseNode, selectStatus: boolean): { payload: { node: BaseNode, propertyFolder: BasePropertyFolder } }
      {
        let settingsProperties;

        if (node && selectStatus)
        { // populate settings object
          settingsProperties = new PropertyFolder("Settings");

          const generalProperties = new PropertyFolder("General Properties");
          node.populateInfo(generalProperties);
          settingsProperties.addChild(generalProperties);

          const statistics = new PropertyFolder("Statistics");
          node.populateStatistics(statistics);
          settingsProperties.addChild(statistics);

          NodeUtils.properties = settingsProperties;
        }
        return {
          payload: { node, propertyFolder: settingsProperties }
        };
      }
    },
    onSettingChange: {
      reducer(state: ISettingsState, action: PayloadAction<{ id: string, value: any }>)
      {
        state.properties.byId[action.payload.id].value = action.payload.value;
      },
      prepare(propertyId: string, value: any)
      {
        SettingsNodeUtils.setPropertyValue(propertyId, value);
        return {
          payload: { id: propertyId, value }
        };
      }
    },
    onExpandChange: {
      reducer(state: ISettingsState, action: PayloadAction<{ id: string, expandStatus: boolean }>)
      {
        const property = state.properties.byId[action.payload.id];
        if (property)
        {
          property.expanded = action.payload.expandStatus;
        }
      },
      prepare(propertyId: string, expanded: boolean)
      {
        SettingsNodeUtils.setPropertyFolderExpand(propertyId, expanded);
        return {
          payload: { id: propertyId, expandStatus: expanded }
        };
      }

    }
  },
  extraReducers: {}
});

export default settingsSlice.reducer;
export const { onSelectedNodeChange, onSettingChange, onExpandChange } = settingsSlice.actions;

function convertToSettingsState(properties: BaseProperty[] | BasePropertyFolder[], parent?: string): ISettingsPropertyState[]
{
  let allPropertyStates: ISettingsPropertyState[] = [];

  if (properties && properties.length)
  {
    for (const property of properties)
    {
      const propertyState: ISettingsPropertyState = {
        name: property.getName(),
        parent,
        displayName: property.displayName(),
        type: mapToInputTypes(property.getType()),
        expanded: (property as BasePropertyFolder).expanded,
        readonly: property.isReadOnly(),
        value: (property as UsePropertyT<any>).value,
        children: []
      };

      const childStates = convertToSettingsState(property.children, property.getName());
      propertyState.children = property.children.map(child => child.getName());
      allPropertyStates.push(propertyState);
      allPropertyStates = allPropertyStates.concat(childStates);
    }
  }

  return allPropertyStates;
}

function mapToInputTypes(type: PropertyType): string
{
  if (type === PropertyType.String)
    return ElementTypes.INPUT;
  if (type === PropertyType.Color)
    return ElementTypes.COLOR_TABLE;
  if (type === PropertyType.StringGroup)
    return ElementTypes.INPUT_GROUP;
  if (type === PropertyType.DefaultPropertyFolder)
    return ElementTypes.SECTION;
  return "";
}
