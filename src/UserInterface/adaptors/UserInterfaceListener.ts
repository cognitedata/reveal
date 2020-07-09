import { IUserInterface } from "@/Core/Interfaces/IUserInterface";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import NotificationsToActionsAdaptor from "@/UserInterface/adaptors/NotificationToAction";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";


/**
 * Gets callbacks from Core components when various events happen
 * such as creation of a BaseNode.
 */
class UserInterfaceListener implements IUserInterface {

  private readonly notificationAdaptor: NotificationsToActionsAdaptor;

  public constructor(notificationAdaptor: NotificationsToActionsAdaptor) {
    this.notificationAdaptor = notificationAdaptor;
  }

  updateNode(node: BaseNode, args: NodeEventArgs): void {
    this.notificationAdaptor.processEvent(node, args);
  }

  setFullScreen(isFullScreen: boolean): void {
    this.notificationAdaptor.setFullScreen(isFullScreen);
  }

  updateStatusPanel(statusText: string): void {
    this.notificationAdaptor.updateStatusPanel(statusText);
  }
}

export default UserInterfaceListener;
