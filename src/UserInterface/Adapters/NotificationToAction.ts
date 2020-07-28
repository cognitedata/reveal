import { Dispatch } from "redux";
import { Changes } from "@/Core/Views/Changes";
import { CheckBoxState } from "@/Core/Enums/CheckBoxState";

import { BaseNode } from "@/Core/Nodes/BaseNode";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { changeSelectState } from "@/UserInterface/Redux/actions/common";
import {
  changeActiveState,
  changeCheckboxState,
  changeNodeColor,
  changeNodeName
} from "@/UserInterface/Redux/actions/explorer";

const mapToCheckboxStateStr = (cbState: CheckBoxState) => {
  switch (cbState) {
    case CheckBoxState.All: return 'checked';
    case CheckBoxState.None: return 'unchecked';
    case CheckBoxState.Disabled: return 'disabled';
    case CheckBoxState.Some: return 'partial';
    default: return 'undefined';
  }
};

class NotificationsToActionsAdaptor
{
  private readonly dispatcher: Dispatch;

  public constructor(dispatcher: Dispatch)
  {
    this.dispatcher = dispatcher;
  }

  processEvent(sender: BaseNode, args: NodeEventArgs): void
  {
    // console.log('notification ', sender, args);
    if (args.isEmpty)
    { return; }

    // test for all changes that are relevant for us
    if (args.isChanged(Changes.visibleState))
      this.dispatcher(changeCheckboxState(sender.uniqueId.toString(), mapToCheckboxStateStr(sender.getCheckBoxState())));
    if (args.isChanged(Changes.selected))
      this.dispatcher(changeSelectState(sender.uniqueId.toString(), sender.IsSelected()));
    if (args.isChanged(Changes.active))
      this.dispatcher(changeActiveState(sender.uniqueId.toString(), sender.isActive));
    if (args.isChanged(Changes.nodeName))
      this.dispatcher(changeNodeName(sender.uniqueId.toString(), sender.getName()));
    if (args.isChanged(Changes.nodeColor))
      this.dispatcher(changeNodeColor(sender.uniqueId.toString(), sender.getColor()));
  }
}

export default NotificationsToActionsAdaptor;
