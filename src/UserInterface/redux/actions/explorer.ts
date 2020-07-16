import {
  TOGGLE_NODE_SELECT,
  TOGGLE_NODE_EXPAND,
  TOGGLE_NODE_CHECK,
  GENERATE_NODE_TREE,
  CHANGE_SELECTED_TAB,
  CHANGE_CHECKBOX_STATE,
  CHANGE_ACTIVE_STATE,
  CHANGE_NODE_NAME,
  CHANGE_NODE_COLOR
} from "@/UserInterface/redux/types/actionTypes";
import { ExplorerCommandPayloadType } from "@/UserInterface/interfaces/explorer";
import Color from "color";

// Explorer Actions
export const onToggleNodeSelect = (payload: ExplorerCommandPayloadType) =>
{
  return { type: TOGGLE_NODE_SELECT, payload };
};
export const onToggleNodeExpand = (payload: ExplorerCommandPayloadType) =>
{
  return { type: TOGGLE_NODE_EXPAND, payload };
};
export const onToggleNodeCheck = (payload: ExplorerCommandPayloadType) =>
{
  return { type: TOGGLE_NODE_CHECK, payload };
};
export const generateNodeTree = (payload: ExplorerCommandPayloadType) =>
{
  return { type: GENERATE_NODE_TREE, payload };
};
export const changeSelectedTab = (payload: ExplorerCommandPayloadType) =>
{
  return { type: CHANGE_SELECTED_TAB, payload };
};
export const changeCheckboxState = (appliesTo: string, payload: any) =>
{
  return { type: CHANGE_CHECKBOX_STATE, appliesTo, payload };
};
export const changeActiveState = (appliesTo: string, payload: any) =>
{
  return { type: CHANGE_ACTIVE_STATE, appliesTo, payload };
};
export const changeNodeName = (appliesTo: string, payload: string) =>
{
  return { type: CHANGE_NODE_NAME, appliesTo, payload };
};
export const changeNodeColor = (appliesTo: string, payload: Color) =>
{
  return { type: CHANGE_NODE_COLOR, appliesTo, payload };
};
