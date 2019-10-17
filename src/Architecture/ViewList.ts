import { BaseView } from "../Views/BaseView";
import { TargetNode } from "../Nodes/TargetNode";

export class ViewList
{
    //==================================================
    // FIELDS
    //==================================================

    public list: Array<BaseView> = new Array<BaseView>();

    //==================================================
    // CONSTRUCTORS
    //==================================================

    public constructor() { }

    //==================================================
    // INSTANCE METHODS
    //==================================================

    public add(view: BaseView): void
    {
        this.list.push(view);
    }

    public remove(view: BaseView): boolean
    {
        const index = this.list.indexOf(view, 0);
        if (index < 0)
            return false;

        this.list.splice(index, 1);
        return true;
    }

    public clear(): void
    {
        this.list.splice(0, this.list.length);
    }

    public getViewByTarget(target: TargetNode): BaseView | null
    {
        var view = this.list.find((view: BaseView) => view.target == target);
        return view == undefined ? null : view;
    }
}
