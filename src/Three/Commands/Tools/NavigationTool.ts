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
  // CONSTRUCTOR
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null)
  {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ getName(): string { return "Navigation"; }
  public /*override*/ getIcon(): string { return PanBaseToolIcon; }

  protected /*override*/ getTooltipCore(): string
  {
    return `${this.getDisplayName()}\n` +
    "Left button drag: Rotate\n" +
    "Right button drag: Move\n" +
    "Wheel: Zoom in or out\n" +
    "Left click: Pick any object in 3D to get information";
  }

  //==================================================
  // OVERRIDES of BaseTool
  //==================================================

  public /*override*/ onActivate(): void
  {
    const { target } = this;
    if (!target)
      return;

    const { viewInfo } = target;
    viewInfo.clear();
    viewInfo.addActiveTool(this);
    target.invalidate();
  }

  public /*override*/ onMouseDown(event: MouseEvent): void
  {
    this._movementX = event.clientX;
    this._movementY = event.clientY;
  }

  public /*override*/ onMouseUp(event: MouseEvent): void
  {
    if (event.clientX === this._movementX && event.clientY === this._movementY)
      this.onShowInfo(event);
  }
}
