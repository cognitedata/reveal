import { IUserInterface } from '../Interfaces/IUserInterface';
import { BaseNode } from '../Nodes/BaseNode';
import { NodeEventArgs } from '../Views/NodeEventArgs';

export class VirtualUserInterface {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  private static userInterface: IUserInterface | null = null;

  //= =================================================
  // STATIC METHODS
  //= =================================================

  static install(userInterface: IUserInterface | null): void {
    this.userInterface = userInterface;
  }

  static updateNode(node: BaseNode, args: NodeEventArgs): void {
    VirtualUserInterface.userInterface?.updateNode(node, args);
  }

  static setFullScreen(isFullScreen: boolean): void {
    VirtualUserInterface.userInterface?.setFullScreen(isFullScreen);
  }

  static updateToolbars(): void {
    VirtualUserInterface.userInterface?.updateToolbars();
  }

  static updateStatusPanel(statusText: string): void {
    VirtualUserInterface.userInterface?.updateStatusPanel(statusText);
  }
}
