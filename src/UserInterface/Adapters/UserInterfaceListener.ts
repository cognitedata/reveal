import { Dispatch } from 'redux';
import { IUserInterface } from "@/Core/Interfaces/IUserInterface";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import NotificationsToActionsAdaptor from "@/UserInterface/Adapters/NotificationToAction";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { setFullScreen } from "@/UserInterface/Redux/actions/common";
import { updateVisualizerToolbars, updateStatusPanel } from '@/UserInterface/Redux/reducers/VisualizersReducer';

/**
 * Gets callbacks from Core Components when various events happen
 * such as creation of a BaseNode.
 */
class UserInterfaceListener implements IUserInterface
{

  private readonly notificationAdaptor: NotificationsToActionsAdaptor;

  private readonly dispatcher: Dispatch;

  public constructor(notificationAdaptor: NotificationsToActionsAdaptor, dispatcher: Dispatch)
  {
    this.notificationAdaptor = notificationAdaptor;
    this.dispatcher = dispatcher;
  }

  updateNode(node: BaseNode, args: NodeEventArgs): void
  {
    this.notificationAdaptor.processEvent(node, args);
  }

  setFullScreen(isFullScreen: boolean): void
  {
    this.dispatcher(setFullScreen(isFullScreen));
  }

  updateToolbars(): void
  {
    this.dispatcher(updateVisualizerToolbars());
  }

  updateStatusPanel(statusText: string): void
  {
    this.dispatcher(updateStatusPanel({ text: statusText }));
  }
}

export default UserInterfaceListener;
