import { BaseNode } from '../Nodes/BaseNode';
import { NodeEventArgs } from '../Views/NodeEventArgs';

export interface IUserInterface {
  updateNode(node: BaseNode, args: NodeEventArgs): void;
  setFullScreen(isFullScreen: boolean): void;
  updateToolbars(): void;
  updateStatusPanel(statusText: string): void;
}
