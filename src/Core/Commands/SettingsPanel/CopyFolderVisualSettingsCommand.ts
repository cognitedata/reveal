/* eslint-disable quotes */
import FolderIcon from "@images/Actions/Folder.png";
import { BaseNodeCommand } from "@/Core/Commands/BaseNodeCommand";
import { BaseRenderStyle } from '@/Core/Styles/BaseRenderStyle';
import { NodeEventArgs } from '@/Core/Views/NodeEventArgs';
import { Changes } from '@/Core/Views/Changes';

export class CopyFolderVisualSettingsCommand extends BaseNodeCommand
{
  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ getTooltip(): string { return "Copy the visual settings to all similar domain objects in the folder"; }
  public /*override*/ getIcon(): string { return FolderIcon; }
  public /*override*/ getName(): string { return "Copy Similar Folder Settings"; };

  protected /*override*/ invokeCore(): boolean 
  {
    const { node } = this;
    if (!node)
      return false;

    const root = node.parent;
    if (!root)
      return false;

    const style = node.getRenderStyle();
    if (!style)
      return false;

    for (const child of root.children)
    {
      if (child === node)
        continue;

      if (typeof child !== typeof node)
        continue;

      const copyStyle = style.clone() as BaseRenderStyle;
      if (copyStyle == null)
        return false;

      if (!child.replaceRenderStyle(copyStyle))
        continue;

      child.notify(new NodeEventArgs(Changes.renderStyle));
    }
    return true;
  }
}
