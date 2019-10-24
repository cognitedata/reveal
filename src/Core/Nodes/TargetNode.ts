
import { BaseCameraNode } from "./BaseCameraNode";
import { Colors } from "../PrimitivClasses/Colors";
import { BaseTargetNode } from "./BaseTargetNode";

export abstract class TargetNode extends BaseTargetNode 
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor()
  {
    super();
    this.color = Colors.black;
  }

  //==================================================
  // PROPERTIES
  //==================================================

  public getActiveCameraNode(): BaseCameraNode
  {
    const camera = this.getActiveChildByType(BaseCameraNode);
    if (!camera)
      throw Error("Can not find the camera, shoul be added");
    return camera as BaseCameraNode;
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return TargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === TargetNode.name || super.isA(className); }

}
