import { BaseView } from "../Views/BaseView";
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
    // CONSTRUCTORS
    //==================================================

    protected constructor() {}

    //==================================================
    // CONSTRUCTORS
    //==================================================

    public notify(args: NodeEventArgs): void
    {
        for(var view of this._views.list)
          view.update(args);
    }


    public setVisibleInteractive(visible: boolean, target: TargetNode): void
    {
      if (this.setVisible(visible, target))
        this.notify(new NodeEventArgs(NodeEventArgs.nodeVisible))
    }

    public setVisible(visible: boolean, target: TargetNode) : boolean
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


    public isVisible(target: TargetNode): boolean
    {
      let view = this.views.getViewByTarget(target);
      if (view == null)
        return false;

      return view.isVisible;
    }
}