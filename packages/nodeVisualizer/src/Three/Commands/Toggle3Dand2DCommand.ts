import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import Icon from "@images/Commands/Toggle3Dand2DCommand.png";

export class Toggle3Dand2DCommand extends ThreeRenderTargetCommand {
  private wasPerspectiveMode = true;

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  public /* override */ getName(): string { return "View in 2D"; }

  public /* override */ getIcon(): string { return Icon; }

  public /* override */ get isCheckable(): boolean { return true; }

  public /* override */ get isChecked(): boolean {
    if (!this.target)
      return false;

    const { cameraControl } = this.target;
    if (!cameraControl)
      return false;

    return cameraControl.is2D;
  }

  protected /* override */ invokeCore(): boolean {
    if (!this.target)
      return false;

    const { cameraControl } = this.target;
    if (!cameraControl)
      return false;

    cameraControl.is2D = !cameraControl.is2D;
    if (cameraControl.is2D) {
      this.wasPerspectiveMode = this.target.isPerspectiveMode;
      if (this.target.isPerspectiveMode)
        this.target.isPerspectiveMode = false;
      this.target.viewFrom(0);
    } else {
      if (!this.target.isPerspectiveMode)
        this.target.isPerspectiveMode = this.wasPerspectiveMode;
      this.target.viewFrom(-1);
    }
    cameraControl.setLeftButton(this.target.activeTool);
    this.target.updateAllViews();

    return true;
  }
}
