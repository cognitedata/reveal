import { TargetId } from "@/Core/Primitives/TargetId";
import { Target } from "@/Core/Interfaces/Target";
import { ViewFactory } from "@/Core/Views/ViewFactory";
import { ViewList } from "@/Core/Views/ViewList";
import { BaseView } from "@/Core/Views/BaseView";
import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { BaseNode, cocatinate } from "@/Core/Nodes/BaseNode";
import { isInstanceOf, Class } from "@/Core/Primitives/ClassT";
import { Colors } from "@/Core/Primitives/Colors";
import * as color from "color"

export abstract class BaseTargetNode extends BaseNode implements Target
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { super(); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _viewsShownHere: ViewList = new ViewList();
  public isLightBackground: boolean = false;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get viewsShownHere(): ViewList { return this._viewsShownHere; }
  public get targetId(): TargetId { return new TargetId(this.className, this.uniqueId); }
  public get fgColor(): color { return this.isLightBackground ? Colors.black : Colors.white; }
  public get bgColor(): color { return this.color; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseTargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === BaseTargetNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get color(): color { return this.isLightBackground ? Colors.white : Colors.black; }
  public /*override*/ get typeName(): string { return "Target" }
  public /*override*/ get canBeActive(): boolean { return true; }

  public /*override*/ getDebugString(): string
  {
    let result = super.getDebugString();
    if (this.viewsShownHere.count > 0)
      result += cocatinate("viewsShownHere", this.viewsShownHere.count);
    return result;
  }

  protected /*override*/ removeInteractiveCore(): void
  {
    this.removeAllViewsShownHere();
    super.removeInteractiveCore();
  }

  //==================================================
  // IMPLEMENTATION of Target
  //==================================================

  public canShowView(node: BaseVisualNode): boolean
  {
    return ViewFactory.instance.canCreate(node, this.className);
  }

  public isVisibleView(node: BaseVisualNode): boolean
  {
    const view = node.views.getViewByTarget(this);
    if (!view)
      return false;

    return view.isVisible;
  }

  public showView(node: BaseVisualNode): boolean
  {
    let view = node.views.getViewByTarget(this);
    if (!view)
    {
      view = this.createViewCore(node);
      if (!view)
        return false;

      view.attach(node, this);
      node.views.add(view);
      this._viewsShownHere.add(view);
      view.isVisible = true;
      view.initialize();
    }
    else if (view.stayAliveIfInvisible)
    {
      if (view.isVisible)
        return false;
      else
        view.isVisible = true;
    }
    else
      return false;

    view.onShow();
    return true;
  }

  public hideView(node: BaseVisualNode): boolean
  {
    const view = node.views.getViewByTarget(this);
    if (!view)
      return false;

    if (view.stayAliveIfInvisible)
    {
      if (!view.isVisible)
        return false;

      view.onHide();
      view.isVisible = false;
    }
    else
    {
      this.removeViewShownHere(view);
      node.views.remove(view);
    }
    return true;
  }

  public removeViewShownHere(view: BaseView): void
  {
    if (!view.stayAliveIfInvisible || !view.isVisible)
    {
      view.onHide();
      view.isVisible = false;
    }
    view.dispose();
    this._viewsShownHere.remove(view);
    view.detach();
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getBgColor(hasAxis: boolean): color
  {
    if (!hasAxis)
      return this.bgColor;
    return this.isLightBackground ? Colors.lightGrey : Colors.darkGrey;
  }

  private createViewCore(node: BaseVisualNode)
  {
    return ViewFactory.instance.create(node, this.className);
  }

  public removeAllViewsShownHere(): void
  {
    for (const view of this.viewsShownHere.list)
    {
      view.onHide();
      view.isVisible = false;
      view.dispose();
      const node = view.getNode();
      if (node instanceof BaseVisualNode)
        node.views.remove(view);
      view.detach();
    }
    this._viewsShownHere.clear();
  }

  public hasViewOfNodeType<T extends BaseNode>(classType: Class<T>): boolean
  {
    for (const view of this.viewsShownHere.list) 
    {
      const node = view.getNode();
      if (!node)
        continue;

      if (isInstanceOf(node, classType))
        return true;
    }
    return true;
  }
}
