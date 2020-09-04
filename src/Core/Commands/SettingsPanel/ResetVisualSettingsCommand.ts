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

    if (!node.replaceRenderStyle())
      return false;

    node.notify(new NodeEventArgs(Changes.renderStyle));
    return true;
  }
}
