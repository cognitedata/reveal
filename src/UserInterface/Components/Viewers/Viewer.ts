import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import Toolbar from "@/UserInterface/NodeVisualizer/ToolBar/Toolbar";
import { BaseCommand } from '@/Core/Commands/BaseCommand';

export default class Viewer
{

  // Name of the viewer
  private name: string;

  // Holds reference to HTML element
  private htmlElement: HTMLElement | null = null;

  // Holds a reference to ThreeJs target
  private target: ThreeRenderTargetNode | null = null;

  // Holds a reference to view toolbar
  private toolbarCommands: BaseCommand[] | null = null;

  constructor(name: string, ref: any)
  {
    this.name = name;
    this.htmlElement = ref;
  }

  public setTarget(target: ThreeRenderTargetNode) { this.target = target; }

  public setToolbarCommands(toolbar: Toolbar) 
  {
    this.toolbarCommands = toolbar.getCommands();
  }

  public getTarget() { return this.target; };

  public getToolbarCommands() { return this.toolbarCommands; };

  public getHTMLElement() { return this.htmlElement; };

  public getName() { return this.name; };
}
