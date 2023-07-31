import * as Color from 'color';

import { ITarget } from '../Interfaces/ITarget';
import { isInstanceOf, Class } from '../Primitives/ClassT';
import { Colors } from '../Primitives/Colors';
import { TargetId } from '../Primitives/TargetId';
import { Util } from '../Primitives/Util';
import { BaseView } from '../Views/BaseView';
import { ViewFactory } from '../Views/ViewFactory';
import { ViewList } from '../Views/ViewList';

import { BaseNode } from './BaseNode';
import { BaseVisualNode } from './BaseVisualNode';

export abstract class BaseTargetNode extends BaseNode implements ITarget {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'BaseTargetNode';

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  protected constructor() {
    super();
  }

  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private _viewsShownHere: ViewList = new ViewList();

  public isLightBackground = false;

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get viewsShownHere(): ViewList {
    return this._viewsShownHere;
  }

  public get targetId(): TargetId {
    return new TargetId(this.className, this.uniqueId);
  }

  public get fgColor(): Color {
    return this.isLightBackground ? Colors.black : Colors.white;
  }

  public get bgColor(): Color {
    return this.getColor();
  }

  //= =================================================
  // OVERRIDES of Identifiable
  //= =================================================

  public get /* override */ className(): string {
    return BaseTargetNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === BaseTargetNode.className || super.isA(className);
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public /* override */ getColor(): Color {
    return this.isLightBackground ? Colors.white : Colors.black;
  }

  public get /* override */ typeName(): string {
    return 'Target';
  }

  public /* override */ canBeActive(): boolean {
    return true;
  }

  public /* override */ getDebugString(): string {
    let result = super.getDebugString();
    if (this.viewsShownHere.count > 0)
      result += Util.cocatinate('viewsShownHere', this.viewsShownHere.count);
    return result;
  }

  protected /* override */ removeInternalData(): void {
    this.removeAllViewsShownHere();
    super.removeInternalData();
  }

  //= =================================================
  // IMPLEMENTATION of Target
  //= =================================================

  public canShowView(node: BaseVisualNode): boolean {
    return ViewFactory.instance.canCreate(node, this.className);
  }

  public hasView(node: BaseVisualNode): boolean {
    return node.views.getViewByTarget(this) != null;
  }

  public hasVisibleView(node: BaseVisualNode): boolean {
    const view = node.views.getViewByTarget(this);
    if (!view) return false;

    return view.isVisible;
  }

  public showView(node: BaseVisualNode): boolean {
    let view = node.views.getViewByTarget(this);
    if (!view) {
      view = this.createViewCore(node);
      if (!view) return false;

      view.attach(node, this);
      node.views.add(view);
      this._viewsShownHere.add(view);
      // view.isVisible = true;
      view.initialize();
    } else return false;

    view.onShow();

    return true;
  }

  public hideView(node: BaseVisualNode): boolean {
    const view = node.views.getViewByTarget(this);
    if (!view) return false;

    this.removeViewShownHere(view);
    node.views.remove(view);
    return true;
  }

  public removeViewShownHere(view: BaseView): void {
    // if (!view.stayAliveIfInvisible || !view.isVisible)
    // {
    //   view.onHide();
    //   view.isVisible = false;
    // }
    if (view.isVisible) view.onHide();

    view.dispose();
    this._viewsShownHere.remove(view);
    view.detach();
  }

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  public getBgColor(hasAxis: boolean): Color {
    if (!hasAxis) return this.bgColor;
    return this.isLightBackground ? Colors.lightGrey : Colors.darkGrey;
  }

  private createViewCore(node: BaseVisualNode) {
    return ViewFactory.instance.create(node, this.className);
  }

  public removeAllViewsShownHere(): void {
    for (const view of this.viewsShownHere.list) {
      view.onHide();
      // view.isVisible = false;
      view.dispose();
      const node = view.getNode();
      if (node instanceof BaseVisualNode) node.views.remove(view);
      view.detach();
    }
    this._viewsShownHere.clear();
  }

  public hasViewOfNodeType<T extends BaseNode>(classType: Class<T>): boolean {
    for (const view of this.viewsShownHere.list) {
      const node = view.getNode();
      if (!node) continue;

      if (!isInstanceOf(node, classType)) continue;

      if (view.isVisible) return true;
    }
    return false;
  }

  public getViewByNode(node: BaseNode): BaseView | null {
    for (const view of this.viewsShownHere.list) {
      const otherNode = view.getNode();
      if (!otherNode) continue;

      if (otherNode === node) return view;
    }
    return null;
  }
}
