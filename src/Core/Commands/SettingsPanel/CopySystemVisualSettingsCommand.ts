import SolutionIcon from "@images/Actions/Solution.png";
import { BaseNodeCommand } from "@/Core/Commands/BaseNodeCommand";

export class CopySystemVisualSettingsCommand extends BaseNodeCommand
{
  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ getTooltip(): string { return "Copy the visual settings to all similar domain objects in the entire system"; }

  public /*override*/ getIcon(): string { return SolutionIcon; }

  public /*override*/ getName(): string { return "Copy Domain Settings"; };

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
