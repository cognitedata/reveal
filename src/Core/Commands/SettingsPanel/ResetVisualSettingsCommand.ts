import ResetIcon from "@images/Actions/Reset.png";
import { BaseNodeCommand } from "@/Core/Commands/BaseNodeCommand";
import { Changes } from "@/Core/Views/Changes";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

export class ResetVisualSettingsCommand extends BaseNodeCommand
{
  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ getTooltip(): string { return "Reset to the visual settings to default"; }
  public /*override*/ getIcon(): string { return ResetIcon; }
  public /*override*/ getName(): string { return "Reset Settings"; };

  protected /*override*/ invokeCore(): boolean 
  {
    if (!this.node)
      return false;

    let node = this.node.renderStyleRoot;
    if (!node)
      node = this.node;

    const target = node.activeTarget;
    if (!target)
      return false;

    const { targetId } = target;
    if (!targetId)
      return false;

    // Find the style in the node itself
    for (let i = 0; i < node.renderStyles.length; i++)
    {
      const oldStyle = node.renderStyles[i];
      if (oldStyle.isDefault)
        continue;

      if (!oldStyle.targetId.equals(targetId, node.renderStyleResolution))
        continue;

      node.renderStyles.splice(i, 1);
      break;
    }
    const newStyle = node.createRenderStyle(targetId);
    if (!newStyle)
      return false;

    newStyle.targetId.set(targetId, node.renderStyleResolution);
    node.renderStyles.push(newStyle);
    node.notify(new NodeEventArgs(Changes.renderStyle));
    return true;
  }
}
