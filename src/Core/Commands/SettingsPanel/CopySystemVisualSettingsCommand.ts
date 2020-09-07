/* eslint-disable quotes */
import SolutionIcon from "@images/Actions/Solution.png";
import { BaseNodeCommand } from "@/Core/Commands/BaseNodeCommand";
import { BaseRenderStyle } from '@/Core/Styles/BaseRenderStyle';
import { NodeEventArgs } from '@/Core/Views/NodeEventArgs';
import { Changes } from '@/Core/Views/Changes';

export class CopySystemVisualSettingsCommand extends BaseNodeCommand
{
  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ getTooltip(): string { return "\nCopy the visual settings to all similar domain objects in the entire system"; }
  public /*override*/ getIcon(): string { return SolutionIcon; }
  public /*override*/ getName(): string { return "Copy Domain Settings"; };

  protected /*override*/ invokeCore(): boolean 
  {
    const { node } = this;
    if (!node)
      return false;

    const root = node.getTreeNode();
    if (!root)
      return false;

    const style = node.getRenderStyle();
    if (!style)
      return false;

    for (const child of root.getDescendants())
    {
      if (child === node)
        continue;

      if (typeof child !== typeof node)
        continue;

      const copyStyle = style.clone() as BaseRenderStyle;
      if (!copyStyle)
        return false;

      if (!child.replaceRenderStyle(copyStyle))
        continue;

      child.notify(new NodeEventArgs(Changes.renderStyle));
    }
    return true;
  }
}
