import { BaseNode } from "./BaseNode";

export class Render3DTargetNode extends BaseNode
{
    public static readonly staticClassName = "Render3DTargetNode"; 

    public get className(): string { return Render3DTargetNode.staticClassName; }

    public constructor()
    {
        super();
    }
}