import {
  GENERATE_NODE_TREE,
  CHANGE_SELECTED_TAB,
  CHANGE_CHECKBOX_STATE,
  CHANGE_ACTIVE_STATE,
  CHANGE_NODE_NAME,
  CHANGE_NODE_COLOR,
  CHANGE_EXPAND_STATE,
  CHANGE_SELECT_STATE
} from "@/UserInterface/Redux/actions/actionTypes";
import Color from "color";
import {BaseRootNode} from "@/Core/Nodes/BaseRootNode";

export type ExplorerCommandPayloadType = {
  uniqueId?: string;
  expandState?: boolean;
  checkState?: boolean;
  selectState?: boolean;
  root?: BaseRootNode;
  tabIndex?: number;
};

// Explorer Actions
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
export const changeSelectState = (appliesTo: string, selected: boolean) =>
{
  return { type: CHANGE_SELECT_STATE, payload: { id: appliesTo, selected } };
};
export const changeExpandedState = (appliesTo: string, payload: boolean) =>
{
  return { type: CHANGE_EXPAND_STATE, appliesTo, payload };
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
