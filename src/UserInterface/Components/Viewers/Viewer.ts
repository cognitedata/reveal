import { Toolbar } from "@/UserInterface/NodeVisualizer/ToolBar/Toolbar";
import { IToolbarGroups } from "@/Core/Interfaces/IToolbarGroups";
import { BaseRenderTargetNode } from "@/Core/Nodes/BaseRenderTargetNode";

export class Viewer {

  // Name of the viewer
  private name: string;

  // Holds reference to HTML element
  private htmlElement: HTMLElement | null = null;

  // Holds a reference to ThreeJs target
  private target: BaseRenderTargetNode | null = null;

  // Holds a reference to view toolbar
  private toolbarCommands: IToolbarGroups = {};

  constructor(name: string, ref: any) {
    this.name = name;
    this.htmlElement = ref;
  }

  public setTarget(target: BaseRenderTargetNode) { this.target = target; }

  public setToolbarCommands(toolbar: Toolbar) {
    this.toolbarCommands = toolbar.getCommands();
  }

  public getTarget() { return this.target; };

  public getToolbarCommands() { return this.toolbarCommands; };

  public getHTMLElement() { return this.htmlElement; };

  public getName() { return this.name; };
}
