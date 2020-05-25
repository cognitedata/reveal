
import { ThreeRenderTargetNode } from "../Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "./ThreeRenderTargetCommand";

export class ViewAllCommand extends ThreeRenderTargetCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public get name(): string { return "View all" }
  
  protected invokeCore(): boolean {
    if (!this.target)
      return false;

    this.target.viewAll();
    return true;
  }
}


