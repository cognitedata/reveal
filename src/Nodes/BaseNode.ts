import { ViewList } from "../Architecture/ViewList";
import { TargetNode } from "./TargetNode";
import { ViewFactory } from "../Architecture/ViewFactory";
import { NodeEventArgs } from "../Architecture/NodeEventArgs";


export abstract class BaseNode
{
  //==================================================
  // FIELDS
  //==================================================

  private _name: string = "";
  private _views: ViewList = new ViewList();
  private _children: Array<BaseNode> = new Array<BaseNode>();
  private _parent: BaseNode | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  public get views(): ViewList { return this._views; }

  //==================================================
  // VIRTUAL PROPERTIES 
  //==================================================

  public get name(): string { return this._name; }
  public set name(value: string) { this._name = value; }
  public abstract get className(): string;

  //==================================================
  // PROPERTIES: Child-Parent relationship
  //==================================================

  public get children(): Array<BaseNode> { return this._children; }
  public get childCount(): number { return this._children.length; }
  public get childIndex(): number { return this.parent == null ? -1 : this.parent.children.indexOf(this, 0); }
  public get parent(): BaseNode | null { return this._parent; }
  public get root(): BaseNode { return this.parent != null ? this.parent.root : this; }
  public get hasParent(): boolean { return this._parent != null; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { }

  //==================================================
  // INSTANCE METHODS: Child-Parent relationship
  //==================================================

  public getChild(index: number): BaseNode { return this._children[index]; }

  public getChildOfType<T extends BaseNode>(): T | null
  {
    for (let child of this.children)
      if (child as T != null)
        return child as T;
    return null;
  }

  public *getChildrenByType<T extends BaseNode>()
  {
    for (let child of this.children)
      if (child as T != null)
        yield child as T;
  }

  public *getDescendants()
  {
    for (let child of this.children)
    {
      yield child;
      for (let descendant of child.getDescendants())
      {
        let extraVariableBecauseOfStupidCompiler: BaseNode = descendant;
        yield extraVariableBecauseOfStupidCompiler;
      }
    }
  }

  public *getThisAndDescendants()
  {
    yield this;
    for (let descendant of this.getDescendants())
      yield descendant;
  }

  public *getAncestors()
  {
    let ancestor = parent;
    while (ancestor != null)
    {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public *getThisAndAncestors()
  {
    yield this;
    for (let ancestor of this.getAncestors())
      yield ancestor;
  }

  public addChild(child: BaseNode): void
  {
    this._children.push(child);
    child._parent = this;
  }

  public detach(): boolean
  {
    if (this.parent == null)
      return false;

    let index = this.childIndex;
    if (index < 0)
      return false;

    this.parent.children.splice(index, 1);
    this._parent = null;
    return true;
  }

  //==================================================
  // INSTANCE FUNCTIONS: Visibility and notifying
  //==================================================

  public notify(args: NodeEventArgs): void
  {
    for (var view of this._views.list)
      view.update(args);
  }

  public setVisibleInteractive(visible: boolean, target: TargetNode): void
  {
    if (this.setVisible(visible, target))
      this.notify(new NodeEventArgs(NodeEventArgs.nodeVisible))
  }

  public isVisible(target: TargetNode): boolean
  {
    let view = this.views.getViewByTarget(target);
    if (view == null)
      return false;

    return view.isVisible;
  }

  public setVisible(visible: boolean, target: TargetNode): boolean
  {
    // Returns true if changed.
    let view = this.views.getViewByTarget(target);
    if (view == null)
    {
      view = ViewFactory.instance.create(this, target.className);
      if (view == null)
        return false;

      view.target = target;
      this.views.add(view);
    }
    if (view.isVisible == visible)
      return false;

    view.isVisible = visible;
    return true;
  }
}