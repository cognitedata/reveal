import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";

export abstract class BaseTool extends ThreeRenderTargetCommand {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  public /* override */ get isCheckable(): boolean { return true; }

  public /* override */ get isChecked(): boolean {
    if (!this.target)
      return false;

    return this.target.activeTool === this;
  }

  protected /* override */ invokeCore(): boolean {
    if (!this.target)
      return false;

    this.target.activeTool = this;
    return true;
  }

  //= =================================================
  // VIRTUAL METHODS
  //= =================================================

  public /* virtual */ overrideLeftButton(): boolean { return false; }

  public /* virtual */ onActivate(): void { }

  public /* virtual */ onDeactivate(): void { }

  public /* virtual */ onMouseHover(_event: MouseEvent): void { }

  public /* virtual */ onMouseClick(_event: MouseEvent): void { }

  public /* virtual */ onMouseDown(_event: MouseEvent): void { }

  public /* virtual */ onMouseDrag(_event: MouseEvent): void { }

  public /* virtual */ onMouseUp(_event: MouseEvent): void { }

  public /* virtual */ onKeyDown(_event: KeyboardEvent): void { }

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  public onShowInfo(event: MouseEvent): void {
    const { target } = this;
    if (!target)
      return;

    const { viewInfo } = target;
    const preCount = viewInfo.items.length;
    viewInfo.clear();

    const [view, intersection] = target.getViewByMouseEvent(event);
    if (view && intersection)
      view.onShowInfo(viewInfo, intersection);

    const postCount = viewInfo.items.length;
    if (preCount > 0 || postCount > 0)
      target.invalidate();
  }
}
