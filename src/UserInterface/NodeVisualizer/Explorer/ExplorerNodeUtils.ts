import NodeUtils from "@/UserInterface/utils/NodeUtils";
import { TreeCheckState } from "@/UserInterface/NodeVisualizer/Explorer/TreeCheckState";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { CheckBoxState } from "@/Core/Enums/CheckBoxState";

export default class ExplorerNodeUtils
{

  public static selectNodeById(nodeId: string, selectionState: boolean)
  {
    const node = NodeUtils.getNodeById(nodeId);

    if (!node)
    {
      return;
    }
    try
    {
      node.SetSelectedInteractive(selectionState);
    } catch (err)
    {
      // tslint:disable-next-line:no-console
      console.log("Error Selecting Node", err);
    }
  }

  public static setNodeVisibleById(nodeId: string, visible: boolean)
  {
    const node = NodeUtils.getNodeById(nodeId);

    if (!node)
    {
      return;
    }
    try
    {
      node.setVisibleInteractive(visible);
    } catch (err)
    {
      // tslint:disable-next-line:no-console
      console.log("Error Viewing Node", err);
    }
  }

  public static setNodeExpandById(nodeId: string, expandState: boolean)
  {
    const node = NodeUtils.getNodeById(nodeId);

    if (!node)
    {
      return;
    }
    try
    {
      if(expandState !== node.isExpanded){
        node.toggleExpandInteractive();
      }
    } catch (err)
    {
      // tslint:disable-next-line:no-console
      console.log("Error Expanding Node", err);
    }
  }

  public static getCheckBoxStateByNode(node: BaseNode): TreeCheckState
  {
    let checkState = TreeCheckState.Default;
    if (node)
    {
      const coreCheckState = node.getCheckBoxState();
      switch (coreCheckState)
      {
        case CheckBoxState.All:
          checkState = TreeCheckState.Checked;
          break;
        case CheckBoxState.None:
          checkState = TreeCheckState.UnChecked;
          break;
        case CheckBoxState.Disabled:
          checkState = TreeCheckState.Disabled;
          break;
        case CheckBoxState.Some:
          checkState = TreeCheckState.Partial;
          break;
        default:
          checkState = TreeCheckState.Default;
      }
    }
    return checkState;
  }

  public static getAllTabNodes(): BaseNode[]
  {
    const rootNode = NodeUtils.getTreeRoot();
    const tabNodes: BaseNode[] = [];
    if(rootNode)
    {
      for(const child of rootNode.children)
      {
        if (child.isTab)
          tabNodes.push(child);
      }
    }
    return tabNodes;
  }

}
