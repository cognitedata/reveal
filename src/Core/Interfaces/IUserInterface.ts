
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

export interface IUserInterface
{
  // Alternative 1. (To be removed?)
  registerNode(node: BaseNode): void;

  // Alternative 2.
  updateNode(node: BaseNode, args: NodeEventArgs): void;
}
