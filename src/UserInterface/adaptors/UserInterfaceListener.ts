import { Dispatch } from 'redux';
import { IUserInterface } from "@/Core/Interfaces/IUserInterface";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import NotificationsToActionsAdaptor from "@/UserInterface/adaptors/NotificationToAction";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { setFullScreeen } from "@/UserInterface/redux/actions/common";



/**
 * Gets callbacks from Core components when various events happen
 * such as creation of a BaseNode.
 */
class UserInterfaceListener implements IUserInterface {

  private readonly notificationAdaptor: NotificationsToActionsAdaptor;
  private readonly dispatcher: Dispatch;

  public constructor(notificationAdaptor: NotificationsToActionsAdaptor, dispatcher: Dispatch) {
    this.notificationAdaptor = notificationAdaptor;
    this.dispatcher = dispatcher;
  }

  updateNode(node: BaseNode, args: NodeEventArgs): void {
    this.notificationAdaptor.processEvent(node, args);
  }

  setFullScreen(isFullScreen: boolean): void {
    this.dispatcher(setFullScreeen(isFullScreen));
  }

  updateStatusPanel(statusText: string): void {
    this.notificationAdaptor.updateStatusPanel(statusText);
  }
}

export default UserInterfaceListener;
