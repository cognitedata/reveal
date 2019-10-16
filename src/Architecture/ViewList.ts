import { BaseView } from "../Views/BaseView";

export class ViewList
{
    //==================================================
    // FIELDS
    //==================================================

    private _list: Array<BaseView> = new Array<BaseView>();

    //==================================================
    // CONSTRUCTORS
    //==================================================

    public constructor() { }

    //==================================================
    // INSTANCE METHODS
    //==================================================

    public add(view: BaseView): void
    {
        this._list.push(view);
    }

    public remove(view: BaseView): boolean
    {
        const index = this._list.indexOf(view, 0);
        if (index < 0)
            return false;

        this._list.splice(index, 1);
        return true;
    }

    public clear(): void
    {
        this._list.splice(0, this._list.length);
    }
}
