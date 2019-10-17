import { BaseNode } from "./BaseNode";

export class TargetNode extends BaseNode
{
    public static readonly staticClassName = "TargetNode"; 

    public get className(): string { return TargetNode.staticClassName; }

    public constructor()
    {
        super();
    }
}