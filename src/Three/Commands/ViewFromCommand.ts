
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";

export class ViewFromCommand extends ThreeRenderTargetCommand {

  private viewFrom: number;
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null, viewFrom: number) {
    super(target);
    this.viewFrom = viewFrom;
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*virtual*/ get name(): string { return "View from " + this.directionName; }

  protected /*virtual*/ invokeCore(): boolean {
    if (!this.target)
      return false;

    this.target.viewFrom(this.viewFrom);
    return true;
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

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


