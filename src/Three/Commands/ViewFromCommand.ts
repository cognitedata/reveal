import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import ViewFromCommandBottomIcon from "@images/Commands/ViewFromCommand_Bottom.png";
import ViewFromCommandTopIcon from "@images/Commands/ViewFromCommand_Top.png";
import ViewFromCommandEastIcon from "@images/Commands/ViewFromCommand_East.png";
import ViewFromCommandWestIcon from "@images/Commands/ViewFromCommand_West.png";
import ViewFromCommandSouthIcon from "@images/Commands/ViewFromCommand_South.png";
import ViewFromCommandNorthIcon from "@images/Commands/ViewFromCommand_North.png";

export class ViewFromCommand extends ThreeRenderTargetCommand {
  private viewFrom: number;
  
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(target: ThreeRenderTargetNode | null, viewFrom: number) {
    super(target);
    this.viewFrom = viewFrom;
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  public /* override */ getName(): string { return `View from ${this.directionName}`; }

  public /* override */ getIcon(): string {
    switch (this.viewFrom) {
      case -1: return "";
      case 0: return ViewFromCommandTopIcon;
      case 1: return ViewFromCommandBottomIcon;
      case 2: return ViewFromCommandSouthIcon;
      case 3: return ViewFromCommandNorthIcon;
      case 4: return ViewFromCommandWestIcon;
      case 5: return ViewFromCommandEastIcon;
      default: return "";
    }
  }

  protected /* override */ invokeCore(): boolean {
    if (!this.target)
      return false;

    this.target.viewFrom(this.viewFrom);
    return true;
  }

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  private get directionName(): string {

    switch (this.viewFrom) {
      case -1: return "Side";
      case 0: return "Top";
      case 1: return "Bottom";
      case 2: return "South";
      case 3: return "North";
      case 4: return "West";
      case 5: return "East";
      default: return "";
    }
  }
}
