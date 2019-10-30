
import { BaseCameraNode } from "./BaseCameraNode";
import { Colors } from "../PrimitivClasses/Colors";
import { BaseTargetNode } from "./BaseTargetNode";
import { Range3 } from "../Geometry/Range3";
import { Base3DView } from "../Views/Base3DView";

export abstract class RenderTargetNode extends BaseTargetNode 
{
  //==================================================
  // FIELDS
  //==================================================

  private static margin: number = 24;
  public static get windowWidth(): number { return window.innerWidth - 1 * RenderTargetNode.margin; }
  public static get windowHeight(): number { return window.innerHeight - 1 * RenderTargetNode.margin; }

  public get aspectRatio(): number { return this.pixelRange.aspectRatio2; }

  private _isInvalidated = true;
  private _fractionRange: Range3;

  public get pixelRange(): Range3
  {
    const x = this._fractionRange.x.min * RenderTargetNode.windowWidth;
    const y = this._fractionRange.y.min * RenderTargetNode.windowHeight;
    const dx = RenderTargetNode.windowWidth * this._fractionRange.x.delta;
    const dy = RenderTargetNode.windowHeight * this._fractionRange.y.delta;

    return Range3.createByMinAndMax(x, y, x + dx, y + dy);
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(fractionRange: Range3 | undefined)
  {
    super();
    this._fractionRange = fractionRange ? fractionRange : Range3.newUnit;
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

  protected abstract setRenderSize(): void;
  public abstract get domElement(): HTMLElement;
  public /*virtual*/ viewRange(boundingBox: Range3): void { }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public get isInvalidated(): boolean { return this._isInvalidated; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getBoundingBoxFromViews(): Range3
  {
    const boundingBox = new Range3();
    for (const view of this.viewsShownHere.list)
      if (view instanceof Base3DView)
        boundingBox.addRange(view.boundingBox)
    return boundingBox;
  }

  public getActiveCameraNode(): BaseCameraNode
  {
    const camera = this.getActiveChildByType(BaseCameraNode);
    if (!camera)
      throw Error("Can not find the camera, shoul be added");
    return camera as BaseCameraNode;
  }

  public viewAll(): void 
  {
    const boundingBox = this.getBoundingBoxFromViews();
    if (boundingBox)
      this.viewRange(boundingBox);
  }

  public onResize()
  {
    this.setRenderSize();
    const aspect = this.aspectRatio;
    for (const cameraNode of this.getChildrenByType(BaseCameraNode))
      cameraNode.updateAspect(aspect);
    this.Invalidate();
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
