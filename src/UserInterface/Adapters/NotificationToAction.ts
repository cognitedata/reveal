import { Dispatch } from "redux";
import { Changes } from "@/Core/Views/Changes";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { onSelectedNodeChange } from "@/UserInterface/Redux/reducers/SettingsReducer";
import {
  onCheckboxStateChange,
  onExpandStateChange,
  onActiveStateChange,
  onNodeColorChange,
  onNodeNameChange
} from "@/UserInterface/Redux/reducers/ExplorerReducer";

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
      this.dispatcher(onCheckboxStateChange(sender));
    if (args.isChanged(Changes.selected))
      this.dispatcher(onSelectedNodeChange(sender));
    if (args.isChanged(Changes.expanded))
      this.dispatcher(onExpandStateChange(sender));
    if (args.isChanged(Changes.active))
      this.dispatcher(onActiveStateChange(sender));
    if (args.isChanged(Changes.nodeName))
      this.dispatcher(onNodeNameChange(sender));
    if (args.isChanged(Changes.nodeColor))
      this.dispatcher(onNodeColorChange(sender));
  }
}

export default NotificationsToActionsAdaptor;
