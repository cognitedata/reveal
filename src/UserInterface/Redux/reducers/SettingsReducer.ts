import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import ExpanderProperty from "@/Core/Property/Concrete/Folder/ExpanderProperty";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import NodeUtils from "@/UserInterface/utils/NodeUtils";
import SettingsNodeUtils from "@/UserInterface/NodeVisualizer/Settings/SettingsNodeUtils";
import { IconTypes } from "@/UserInterface/Components/Icon/IconTypes";
import { ISettingsState } from "@/UserInterface/Redux/State/settings";

// Initial settings state
const initialState = {
  currentNodeId: "",
  titleBar: {
    name: "",
    icon: { type: IconTypes.NODES, name: "FolderNode" },
    toolBar: [
      // {
      //   icon: { type: IconTypes.STATES, name: "Pinned" }
      // },
      // {
      //   icon: { type: IconTypes.ARROWS, name: "FatLeft" }
      // },
      // {
      //   icon: { type: IconTypes.ARROWS, name: "FatRight" }
      // }
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
        const { node } = action.payload;
        const { propertyFolder } = action.payload;

        if (node && node.isSelected())
        {
          state.currentNodeId = node.uniqueId.toString();
          state.titleBar.name = node.displayName;
        }
        else
        {
          state.currentNodeId = "";
          state.titleBar.name = "";
        }
      },
      prepare(node: BaseNode): { payload: { node: BaseNode, propertyFolder: BasePropertyFolder } }
      {
        let settingsProperties;

        if (node)
        {
          const selectionState = node.isSelected();

          if (selectionState)
          {
            // populate settings object
            settingsProperties = new ExpanderProperty("Settings");

            const generalProperties = new ExpanderProperty("General Properties");

            node.populateInfo(generalProperties);
            settingsProperties.addChild(generalProperties);

            const statistics = new ExpanderProperty("Statistics");

            node.populateStatistics(statistics);
            settingsProperties.addChild(statistics);

            const visualSettings = new ExpanderProperty("Visual Settings");

            node.populateRenderStyle(visualSettings);
            settingsProperties.addChild(visualSettings);

            NodeUtils.properties = settingsProperties;
          }
        }

        return {
          payload: { node, propertyFolder: settingsProperties }
        };
      }
    },
    onExpandChange: {
      reducer(state: ISettingsState, action: PayloadAction<{ id: string, expandStatus: boolean }>)
      {
        // TODO: Implement this feature
        // const property = state.properties.byId[action.payload.id];

        // if (property)
        // {
        //   property.expanded = action.payload.expandStatus;
        // }
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
export const { onSelectedNodeChange, onExpandChange } = settingsSlice.actions;
