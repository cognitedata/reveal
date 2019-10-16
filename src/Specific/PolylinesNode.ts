import { BaseNode } from "../Nodes/BaseNode";

export class PolylinesNode extends BaseNode
{
    public static readonly staticClassName = "PolylinesNode"; 

    public get className(): string { return PolylinesNode.staticClassName; }

    public constructor()
    {
        super();
    }
}