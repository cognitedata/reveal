import { BaseNode } from "./BaseNode";

export class FolderNode extends BaseNode
{
    public static readonly staticClassName = "FolderNode"; 

    public get className(): string { return FolderNode.staticClassName; }

    public constructor()
    {
        super();
    }
}