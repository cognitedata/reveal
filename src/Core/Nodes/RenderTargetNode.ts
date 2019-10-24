
import { BaseCameraNode } from "./BaseCameraNode";
import { Colors } from "../PrimitivClasses/Colors";
import { BaseTargetNode } from "./BaseTargetNode";

export abstract class RenderTargetNode extends BaseTargetNode 
{
  //==================================================
  // FIELDS
  //==================================================

  private _isInvalidated = true;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor()
  {
    super();
    this.color = Colors.black;
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return RenderTargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === RenderTargetNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ initializeCore()
  {
    super.initializeCore();
    this.Invalidate();
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public abstract get domElement(): HTMLElement;

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public get isInvalidated(): boolean { return this._isInvalidated; }

  public getActiveCameraNode(): BaseCameraNode
  {
    const camera = this.getActiveChildByType(BaseCameraNode);
    if (!camera)
      throw Error("Can not find the camera, shoul be added");
    return camera as BaseCameraNode;
  }

  protected addCameraNode(child: BaseCameraNode, isActive: boolean): void
  {
    // Convenience method, no checking that there is any other active or no updating. (use addChildInteractive() for that)
    child.isActive = isActive;
    this.addChild(child);
  }

  protected Invalidate(value?: boolean): void
  {
    this._isInvalidated = (value === undefined) ? true : value;
  }
}
