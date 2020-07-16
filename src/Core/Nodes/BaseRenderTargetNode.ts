
import { Range3 } from "@/Core/Geometry/Range3";
import { BaseTargetNode } from "@/Core/Nodes/BaseTargetNode";
import { Base3DView } from "@/Core/Views/Base3DView";
import { ViewInfo } from "@/Core/Views/ViewInfo";
import { Appearance } from "@/Core/States/Appearance";

export abstract class BaseRenderTargetNode extends BaseTargetNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "BaseRenderTargetNode";

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _isInvalidated = true;
  private _fractionRange: Range3;
  private _viewInfo = new ViewInfo();

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get viewInfo(): ViewInfo { return this._viewInfo; }
  public get aspectRatio(): number { return this.pixelRange.aspectRatio2; }

  public get pixelRange(): Range3
  {
    const domElement = this.domElement;
    const windowWidth = domElement.clientWidth;
    const windowHeight = domElement.clientHeight;
    const x = this._fractionRange.x.min * windowWidth;
    const y = this._fractionRange.y.min * windowHeight;
    const dx = windowWidth * this._fractionRange.x.delta;
    const dy = windowHeight * this._fractionRange.y.delta;
    return Range3.createByMinAndDelta(x, y, dx, dy);
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(fractionRange: Range3 | undefined)
  {
    super();
    this._fractionRange = fractionRange ? fractionRange : Range3.newUnit;
    this.isLightBackground = Appearance.viewerIsLightBackground;
    this._viewInfo.footer = Appearance.viewerFooter;
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseRenderTargetNode.className; }
  public /*override*/ isA(className: string): boolean { return className === BaseRenderTargetNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ initializeCore(): void
  {
    super.initializeCore();
    this.invalidate();
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public abstract get domElement(): HTMLElement;
  public /*virtual*/ onResize(): void { }
  public /*virtual*/ viewAll(): void { }

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
      if (view instanceof Base3DView && view.isVisible)
        boundingBox.addRange(view.boundingBox);

    return boundingBox;
  }

  public fillViewInfo(): ViewInfo
  {
    const viewInfo = this.viewInfo;
    for (const view of this.viewsShownHere.list)
      if (view instanceof Base3DView)
        view.getViewInfo(viewInfo);
    return viewInfo;
  }

  public invalidate(value?: boolean): void
  {
    if (value === undefined)
      value = true;
    this._isInvalidated = value;
  }
}
