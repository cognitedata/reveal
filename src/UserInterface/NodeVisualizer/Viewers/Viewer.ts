import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import Toolbar from "@/UserInterface/NodeVisualizer/ToolBar/Toolbar";
import ToolbarAdaptor from "../ToolBar/ToolbarAdaptor";
import {ToolbarCommand} from "@/UserInterface/NodeVisualizer/ToolBar/ToolbarCommand";

export default class Viewer {

    // Name of the viewer
    private name: string;
    // Holds reference to HTML element
    private htmlElement: HTMLElement | null = null;
    // Holds a reference to ThreeJs target
    private target: ThreeRenderTargetNode | null = null;
    // Holds a reference to view toolbar
    private toolbar: ToolbarCommand[] | null = null;

    constructor(name: string, ref: any) {
        this.name = name;
        this.htmlElement = ref;
    }

    public setTarget(target: ThreeRenderTargetNode) { this.target = target; }
    public setToolbar(toolbar: Toolbar) { this.toolbar = ToolbarAdaptor.convert(toolbar.getCommands()); }
    public getTarget() { return this.target };
    public getToolbar() { return this.toolbar };
    public getHTMLElement() { return this.htmlElement };
    public getName() { return this.name };
}
