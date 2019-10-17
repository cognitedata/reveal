import { BaseNode } from "./BaseNode";

export class RootNode extends BaseNode
{
    public static readonly staticClassName = "RootNode"; 

    public get className(): string { return RootNode.staticClassName; }

    public constructor()
    {
        super();
    }
}