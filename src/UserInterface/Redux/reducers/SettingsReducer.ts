import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { ISettingsState } from "@/UserInterface/Redux/State/settings";
import Color from "color";
import ActionTypes from "@/UserInterface/Redux/actions/ActionTypes";
import { Appearance } from "@/Core/States/Appearance";
import SettingsNodeUtils from "@/UserInterface/NodeVisualizer/Settings/SettingsNodeUtils";

// Initial settings state
const initialState = {
  currentNodeId: "",
  titleBar: {
    name: "",
    icon: { src: "", description: "", color: "" },
    toolBar: []
  },
  expandedSections: {
    [Appearance.generalSettingsName]: Appearance.generalSettingsDefaultExpanded,
    [Appearance.statisticsName]: Appearance.statisticsDefaultExpanded,
    [Appearance.visualSettingsName]: Appearance.visualSettingsDefaultExpanded,
  }
} as ISettingsState;

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
        if (node && node.isSelected())
        { 
          SettingsNodeUtils.populateSettingsFolder(node);
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
