
import { BaseCameraNode } from "./BaseCameraNode";
import { Colors } from "../PrimitivClasses/Colors";
import { BaseTargetNode } from "./BaseTargetNode";
import { Range3 } from "../Geometry/Range3";

export abstract class RenderTargetNode extends BaseTargetNode 
{
  //==================================================
  // FIELDS
  //==================================================

  private static margin: number = 10;
  public static get windowWidth(): number { return window.innerWidth - RenderTargetNode.margin; }
  public static get windowHeight(): number { return window.innerHeight - RenderTargetNode.margin; }


  public get aspectRatio(): number { return this.pixelRange.x.delta / this.pixelRange.y.delta; }

  private _isInvalidated = true;
  private _range: Range3;

  public get pixelRange(): Range3
  {
    const x = this._range.x.min * RenderTargetNode.windowWidth + RenderTargetNode.margin;
    const y = this._range.y.min * RenderTargetNode.windowHeight + RenderTargetNode.margin;
    const dx = RenderTargetNode.windowWidth * this._range.x.delta;
    const dy = RenderTargetNode.windowHeight * this._range.y.delta;

    return Range3.create(x, y, x + dx, y + dy);
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(range: Range3 | undefined)
  {
    super();
    this._range = range ? range : Range3.newUnit;
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
