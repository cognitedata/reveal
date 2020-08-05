import Color from "color";
import {BaseRootNode} from "@/Core/Nodes/BaseRootNode";
import ActionTypes from "@/UserInterface/Redux/actions/ActionTypes";

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
  return { type: ActionTypes.GENERATE_NODE_TREE, payload };
};
export const changeSelectedTab = (payload: ExplorerCommandPayloadType) =>
{
  return { type: ActionTypes.CHANGE_SELECTED_TAB, payload };
};
export const changeCheckboxState = (appliesTo: string, payload: any) =>
{
  return { type: ActionTypes.CHANGE_CHECKBOX_STATE, appliesTo, payload };
};
export const changeSelectState = (appliesTo: string, selected: boolean) =>
{
  return { type: ActionTypes.CHANGE_SELECT_STATE, payload: { id: appliesTo, selected } };
};
export const changeExpandedState = (appliesTo: string, payload: boolean) =>
{
  return { type: ActionTypes.CHANGE_EXPAND_STATE, appliesTo, payload };
};
export const changeActiveState = (appliesTo: string, payload: any) =>
{
  return { type: ActionTypes.CHANGE_ACTIVE_STATE, appliesTo, payload };
};
export const changeNodeName = (appliesTo: string, payload: string) =>
{
  return { type: ActionTypes.CHANGE_NODE_NAME, appliesTo, payload };
};
export const changeNodeColor = (appliesTo: string, payload: Color) =>
{
  return { type: ActionTypes.CHANGE_NODE_COLOR, appliesTo, payload };
};
