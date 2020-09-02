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

  public /*override*/ invoke(): boolean 
  {
    throw new Error("Method not implemented.");
  }
  
  protected /*override*/ invokeCore(): boolean 
  {
    throw new Error("Method not implemented.");
  }

  protected /*override*/ invokeValueCore(value: string): boolean 
  {
    throw new Error("Method not implemented.");
  }
}
