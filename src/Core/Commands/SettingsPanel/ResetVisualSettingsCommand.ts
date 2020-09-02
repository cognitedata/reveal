import ResetIcon from "@images/Actions/Reset.png";
import { BaseNodeCommand } from "@/Core/Commands/BaseNodeCommand";

export class ResetVisualSettingsCommand extends BaseNodeCommand
{
  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ getTooltip(): string { return "Reset to the visual settings to default"; }

  public /*override*/ getIcon(): string { return ResetIcon; }

  public /*override*/ getName(): string { return "Reset Settings"; };

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
