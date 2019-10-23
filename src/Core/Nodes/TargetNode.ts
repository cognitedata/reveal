import { TargetId } from "../PrimitivClasses/TargetId";
import { Target } from "../Interfaces/Target";
import { ViewFactory } from "../Views/ViewFactory";
import { ViewList } from "../Views/ViewList";
import { BaseView } from "../Views/BaseView";
import { VisualNode } from "./VisualNode";
import { BaseNode } from "./BaseNode";

export abstract class TargetNode extends BaseNode implements Target
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { super(); }

  //==================================================
  // FIELDS
  //==================================================

  private _viewsShownHere: ViewList = new ViewList();

  //==================================================
  // PROPERTIES
  //==================================================

  public get viewsShownHere(): ViewList { return this._viewsShownHere; }
  public get targetId(): TargetId { return new TargetId(this.className, this.uniqueId); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return TargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === TargetNode.name || super.isA(className); }
  public /*override*/ toString(): string { return super.toString() + `, ViewsShownHere: ${this.viewsShownHere.count}`; }

  //==================================================
  // IMPLEMETATION of Target
  //==================================================

  public canShowView(node: VisualNode): boolean
  {
    return ViewFactory.instance.canCreate(node, this.className);
  }

  public isVisibleView(node: VisualNode): boolean
  {
    const view = node.views.getViewByTarget(this);
    if (!view)
      return false;

    return view.isVisible;
  }

  public showView(node: VisualNode): boolean
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

  public hideView(node: VisualNode): boolean
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
      this.removeViewShownHere(view)
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
  // OVERRIDES of VisualNode
  //==================================================

  protected /*override*/ removeInteractiveCore(): void
  {
    this.removeAllViewsShownHere();
    super.removeInteractiveCore();
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected createViewCore(node: VisualNode)
  {
    return ViewFactory.instance.create(node, this.className);
  }

  public removeAllViewsShownHere(): void
  {
    for (const view of this._viewsShownHere.list)
    {
      view.onHide();
      view.isVisible = false;
      view.dispose();
      const node = view.getNode();
      if (node instanceof VisualNode)
        node.views.remove(view); 
      view.detach();
    }
    this._viewsShownHere.clear();
  }
}
