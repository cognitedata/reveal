import NodeUtils from "@/UserInterface/utils/NodeUtils";

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

  public static viewNodeById(nodeId: string)
  {
    const node = NodeUtils.getNodeById(nodeId);

    if (!node)
    {
      return;
    }
    try
    {
      node.toggleVisibleInteractive();
    } catch (err)
    {
      // tslint:disable-next-line:no-console
      console.log("Error Viewing Node", err);
    }
  }

  public static expandNodeById(nodeId: string)
  {
    const node = NodeUtils.getNodeById(nodeId);

    if (!node)
    {
      return;
    }
    try
    {
      node.toggleExpandInteractive();
    } catch (err)
    {
      // tslint:disable-next-line:no-console
      console.log("Error Expanding Node", err);
    }
  }

}
