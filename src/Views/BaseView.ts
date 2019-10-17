import { TargetNode } from "../Nodes/TargetNode";
import { NodeEventArgs } from "../Architecture/NodeEventArgs";

export abstract class BaseView
{
    //==================================================
    // FIELDS
    //==================================================

    private _target: TargetNode | null = null;
    private _isVisible: boolean = false;

    //==================================================
    // PROPERTIES
    //==================================================

    public get target(): TargetNode | null { return this._target; }
    public set target(value: TargetNode|null)   { this._target = value; }

    public get isVisible(): boolean { return this._isVisible; }
    public set isVisible(value: boolean)  { this._isVisible = value; }

    //==================================================
    // CONSTRUCTORS
    //==================================================

    protected constructor() { }

    //==================================================
    // INSTANCE METHODS
    //==================================================

    public update(args: NodeEventArgs) : void
    {
        // Override this function to update your view
    }
}