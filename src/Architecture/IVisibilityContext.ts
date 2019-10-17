import { BaseNode } from "../Nodes/BaseNode";
import { BaseView } from "../Views/BaseView";

export interface IVisibilityContext
{
  CanShowView(node: BaseNode): boolean;
  IsVisibleView(node: BaseNode): boolean;
  IsActiveView(node: BaseNode): boolean;
  ShowView(node: BaseNode): boolean;
  HideView(node: BaseNode): boolean;
  RemoveViewFromContext(view: BaseView): boolean;
}
