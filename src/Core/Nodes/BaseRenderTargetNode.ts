
import { BaseCameraNode } from "@/Core/Nodes/BaseCameraNode";
import { BaseTargetNode } from "@/Core/Nodes/BaseTargetNode";
import { Range3 } from "@/Core/Geometry/Range3";
import { Base3DView } from "@/Core/Views/Base3DView";
import { ViewInfo } from "@/Core/Views/ViewInfo";

export abstract class BaseRenderTargetNode extends BaseTargetNode 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private static margin: number = 24;
  public static get windowWidth(): number { return window.innerWidth - 1 * BaseRenderTargetNode.margin; }
  public static get windowHeight(): number { return window.innerHeight - 1 * BaseRenderTargetNode.margin; }

  public get aspectRatio(): number { return this.pixelRange.aspectRatio2; }

  private _isInvalidated = true;
  private _fractionRange: Range3;

  public get pixelRange(): Range3
  {
    const x = this._fractionRange.x.min * BaseRenderTargetNode.windowWidth;
    const y = this._fractionRange.y.min * BaseRenderTargetNode.windowHeight;
    const dx = BaseRenderTargetNode.windowWidth * this._fractionRange.x.delta;
    const dy = BaseRenderTargetNode.windowHeight * this._fractionRange.y.delta;

    return Range3.createByMinAndDelta(x, y, dx, dy);
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(fractionRange: Range3 | undefined)
  {
    super();
    this._fractionRange = fractionRange ? fractionRange : Range3.newUnit;
    this.isLightBackground = false;
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseRenderTargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === BaseRenderTargetNode.name || super.isA(className); }

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
        boundingBox.addRange(view.boundingBox);
    return boundingBox;
  }

  public getViewInfo(): ViewInfo
  {
    const viewInfo = new ViewInfo();
    for (const view of this.viewsShownHere.list)
      if (view instanceof Base3DView)
        view.getViewInfo(viewInfo);
    return viewInfo;
  }

  public getActiveCameraNode(): BaseCameraNode
  {
    const camera = this.getActiveChildByType(BaseCameraNode);
    if (!camera)
      throw Error("Can not find the camera, should be added");
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
