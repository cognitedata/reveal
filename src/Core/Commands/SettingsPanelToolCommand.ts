import { BaseCommand } from "@/Core/Commands/BaseCommand";
import { BaseNode } from "@/Core/Nodes/BaseNode";

export abstract class SettingsPanelToolCommand extends BaseCommand
{

  public target: null | BaseNode = null; // Get the node to invoke the command on

  //==================================================
  // CONSTRUCTOR
  //==================================================

  protected constructor(target: BaseNode | null = null)
  {
    super();
    this.target = target;
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ get isEnabled(): boolean { return this.target != null; }
}
