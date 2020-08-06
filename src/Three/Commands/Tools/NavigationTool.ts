import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import PanBaseToolIcon from "@images/Commands/NavigationTool.png";

export class NavigationTool extends BaseTool
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _movementX = -1;
  private _movementY = -1;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null)
  {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ getName(): string { return "Navigation"; }
  public /*override*/ getTooltip(): string { return "Navigation\nLeft button: Rotate\nRight button: Pan \nWheel: Zoom\nLeft click: Pick to get information"; }
  public /*override*/ getIcon(): string { return PanBaseToolIcon; }


  public /*override*/ onMouseDown(event: MouseEvent): void
  {
    this._movementX = event.clientX;
    this._movementY = event.clientY;
  }

  public /*override*/ onMouseUp(event: MouseEvent): void
  {
    if (event.clientX == this._movementX && event.clientY == this._movementY)
      this.onShowInfo(event);
  }
}
