
import { ThreeRenderTargetNode } from "../Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "./ThreeRenderTargetCommand";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";

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

  public get name(): string {

    switch (this.viewFrom) {
      case 0: return "View from top";
      case 1: return "View from bottom";
      case 2: return "View from south";
      case 3: return "View from north";
      case 4: return "View from west";
      case 5: return "View from east";
      default: return "";
    }
  }

  protected invokeCore(): boolean {
    if (!this.target)
      return false;

    this.target.viewFrom(this.viewFrom);
    return true;
  }
}


