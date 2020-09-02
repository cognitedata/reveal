import ResetIcon from "@images/Actions/Reset.png";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { SettingsPanelToolCommand } from "../SettingsPanelToolCommand";

export class ResetVisualSettingsCommand extends SettingsPanelToolCommand
{
  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(target: BaseNode)
  {
    super(target);
  }

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
