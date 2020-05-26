
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
      case 2: return "View from north";
      case 3: return "View from south";
      case 4: return "View from east";
      case 5: return "View from west";
      default: return "";
    }
  }

  protected invokeCore(): boolean {
    if (!this.target)
      return false;

    const controls = this.target.controls;
    if (!controls)
      return false;

    const camera = this.target.activeCamera;
    if (!camera)
      return false;

    const boundingBox = this.target.getBoundingBoxFromViews();
    const center = boundingBox.center;

    // TODO: 
    const dz = Math.max(boundingBox.x.delta, boundingBox.y.delta);
    camera.up.set(0,1,0);
    controls.setLookAt(center.x, center.y, center.z + dz, center.x, center.y, center.z);
    this.target.updateLightPosition();
    return true;
  }
}


