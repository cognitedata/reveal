import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import ExpanderProperty from "@/Core/Property/Concrete/Folder/ExpanderProperty";
import NodeUtils from "@/UserInterface/utils/NodeUtils";
import { ISettingsState } from "@/UserInterface/Redux/State/settings";
import Color from "color";
import ActionTypes from "@/UserInterface/Redux/actions/ActionTypes";
import { Appearance } from "@/Core/States/Appearance";

// Initial settings state
const initialState = {
  currentNodeId: "",
  titleBar: {
    name: "",
    icon: { src: "", description: "", color: "" },
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
  },
  expandedSections: {
    [Appearance.generalSettingsFolder]: Appearance.generalSettingsDefaultExpanded,
    [Appearance.statisticsFolder]: Appearance.statisticsDefaultExpanded,
    [Appearance.visualSettingsFolder]: Appearance.visualSettingsDefaultExpanded,
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
      reducer(state: ISettingsState, action: PayloadAction<{ node: BaseNode }>)
      {
        const { node } = action.payload;

        if (node && node.isSelected())
        {
          state.currentNodeId = node.uniqueId.toString();
          state.titleBar.name = node.displayName;
          state.titleBar.icon.src = node.getIcon();
          state.titleBar.icon.color = node.hasIconColor() ? node.getColor().hex() : undefined;
          state.titleBar.icon.description = node.name;
        }
        else
        {
          state.currentNodeId = "";
          state.titleBar.name = "";
          state.titleBar.icon = {};
        }
      },
      prepare(node: BaseNode): { payload: { node: BaseNode } }
      {
        let settings;
        if (node)
        {
          const selectionState = node.isSelected();
          if (selectionState)
          {
            // populate settings object
            settings = new ExpanderProperty("Settings");
            {
              const expander = settings.createExpander(Appearance.generalSettingsFolder);
              node.populateInfo(expander);
            }
            {
              const expander = settings.createExpander(Appearance.statisticsFolder);
              node.populateStatistics(expander);
            }
            {
              const expander = settings.createExpander(Appearance.visualSettingsFolder);
              node.populateRenderStyle(expander);
            }
            NodeUtils.properties = settings;
          }
        }
        return { payload: { node } };
      }
    },
    onSectionExpand: {
      reducer(state: ISettingsState, action: PayloadAction<{ sectionName: string, expandStatus: boolean }>)
      {
        state.expandedSections[action.payload.sectionName] = action.payload.expandStatus;
      },
      prepare(sectionName: string, expandStatus: boolean)
      {
        return { payload: { sectionName, expandStatus } };
      }

    }
  },
  extraReducers: {
    [ActionTypes.changeNodeName]: (state: ISettingsState, action: PayloadAction<{ nodeId: string, newLabel: string }>): ISettingsState =>
    {
      const uniqueId = action.payload.nodeId;
      if (state.currentNodeId === uniqueId)
      {
        state.titleBar.name = action.payload.newLabel;
        state.titleBar.icon.description = action.payload.newLabel;
      }
      return state;
    },
    [ActionTypes.changeNodeColor]: (state: ISettingsState, action: PayloadAction<{ nodeId: string, nodeColor: Color }>): ISettingsState =>
    {
      const uniqueId = action.payload.nodeId;
      if (state.currentNodeId === uniqueId)
        state.titleBar.icon.color = action.payload.nodeColor.hex();

      return state;
    },
    [ActionTypes.changeNodeIcon]: (state: ISettingsState, action: PayloadAction<{ nodeId: string, nodeIcon: string }>): ISettingsState =>
    {
      const uniqueId = action.payload.nodeId;
      if (state.currentNodeId === uniqueId)
        state.titleBar.icon.src = action.payload.nodeIcon;

      return state;
    }
  }
});

export default settingsSlice.reducer;
export const { onSelectedNodeChange, onSectionExpand } = settingsSlice.actions;
