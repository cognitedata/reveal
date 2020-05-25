
import { ThreeRenderTargetNode } from "../Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "./ThreeRenderTargetCommand";

export class ToggleBgColorCommand extends ThreeRenderTargetCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================


  public get name(): string { return "Toggle between black and white backgroud" }

  public /*virtual*/ get isCheckable() { return true; } // Can be checked? (default false)

  public /*virtual*/ get isChecked(): boolean { return this.target ? this.target.isLightBackground : false; }

  protected invokeCore(): boolean {
    if (!this.target)
      return false;

    this.target.isLightBackground = !this.target.isLightBackground;
    this.target.invalidate();
    return true;
  }
}


