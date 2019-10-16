import { BaseView } from "../Views/BaseView";
import { ViewList } from "../Architecture/ViewList";


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

    protected constructor()
    {
    }




}