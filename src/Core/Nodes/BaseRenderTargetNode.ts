
import { Range3 } from "@/Core/Geometry/Range3";
import { BaseTargetNode } from "@/Core/Nodes/BaseTargetNode";
import { Base3DView } from "@/Core/Views/Base3DView";
import { ViewInfo } from "@/Core/Views/ViewInfo";

export abstract class BaseRenderTargetNode extends BaseTargetNode 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public get aspectRatio(): number { return this.pixelRange.aspectRatio2; }

  private _isInvalidated = true;
  private _fractionRange: Range3;

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
    this.invalidate();
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public abstract get domElement(): HTMLElement;
  public /*virtual*/ onResize() { }

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

  public invalidate(value?: boolean): void
  {
    this._isInvalidated = (value === undefined) ? true : value;
  }
}
