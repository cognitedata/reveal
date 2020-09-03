import FolderIcon from "@images/Actions/Folder.png";
import { BaseNodeCommand } from "@/Core/Commands/BaseNodeCommand";

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
    alert("CopyFolderVisualSettingsCommand.InvokeCore is not implemented.");
    return false;
  }
}
