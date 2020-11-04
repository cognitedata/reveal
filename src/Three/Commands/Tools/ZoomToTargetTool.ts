import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import ZoomToTargetBaseToolIcon from "@images/Commands/ZoomToTargetTool.png";
import { VirtualUserInterface } from "@/Core/States/VirtualUserInterface";

export class ZoomToTargetTool extends BaseTool {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  public /* override */ getName(): string { return "Zoom to target"; }

  public /* override */ getIcon(): string { return ZoomToTargetBaseToolIcon; }

  public /* override */ getShortCutKeys(): string { return "S"; }

  protected /* override */ getTooltipCore(): string {
    return `${this.getDisplayName()}\n` +
      "Zoom by clicking on something in the 3D.\n" +
      "This position will then be in the center and\n" +
      "the rotation will be around this point.\n" +
      "Otherwise it works as the navigation tool";
  }

  //= =================================================
  // OVERRIDES of BaseTool
  //= =================================================

  public /* override */ overrideLeftButton(): boolean { return true; }

  public /* override */ onActivate(): void {
    const { target } = this;
    if (!target)
      return;

    const { viewInfo } = target;
    viewInfo.clear();
    viewInfo.addActiveTool(this);
    viewInfo.addText("Zoom by clicking on something in the 3D.");
    viewInfo.addText("This position will then be in the center and");
    viewInfo.addText("the rotation will be around this point.");
    target.invalidate();
  }

  public /* override */ onMouseClick(event: MouseEvent): void {
    const { target } = this;
    if (!target)
      return;

    const worldCoords = target.getClickPosition(event);
    if (!worldCoords)
      return;

    const { cameraControl } = target;
    cameraControl.zoomToTarget(worldCoords);
    target.setPreviousTool();
    VirtualUserInterface.updateToolbars();
  }
}
