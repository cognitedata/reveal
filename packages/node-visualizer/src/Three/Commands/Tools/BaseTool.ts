import { ThreeRenderTargetCommand } from '../../Commands/ThreeRenderTargetCommand';
import { ThreeRenderTargetNode } from '../../Nodes/ThreeRenderTargetNode';

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

  public get /* override */ isCheckable(): boolean {
    return true;
  }

  public get /* override */ isChecked(): boolean {
    if (!this.target) return false;

    return this.target.activeTool === this;
  }

  protected /* override */ invokeCore(): boolean {
    if (!this.target) return false;

    this.target.activeTool = this;
    return true;
  }

  //= =================================================
  // VIRTUAL METHODS
  //= =================================================

  public /* virtual */ overrideLeftButton(): boolean {
    return false;
  }

  public /* virtual */ onActivate(): void {}

  public /* virtual */ onDeactivate(): void {}

  public /* virtual */ onMouseHover(_event: MouseEvent): void {}

  public /* virtual */ onMouseClick(_event: MouseEvent): void {}

  public /* virtual */ onMouseDown(_event: MouseEvent): void {}

  public /* virtual */ onMouseDrag(_event: MouseEvent): void {}

  public /* virtual */ onMouseUp(_event: MouseEvent): void {}

  public /* virtual */ onKeyDown(_event: KeyboardEvent): void {}

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  public onShowInfo(event: MouseEvent): void {
    const { target } = this;
    if (!target) return;

    const { viewInfo, viewsShownHere } = target;
    const preCount = viewInfo.items.length;
    viewInfo.clear();

    const [view, intersection] = target.getViewByMouseEvent(event);
    if (view && intersection) {
      const wellTrajectoryView = viewsShownHere.list.find((item) => {
        const mdUnit = this.getMdUnit(item as any);
        return mdUnit !== undefined;
      });
      const mdUnit = this.getMdUnit(wellTrajectoryView as any);
      view.onShowInfo(viewInfo, intersection, mdUnit);
    }

    const postCount = viewInfo.items.length;
    if (preCount > 0 || postCount > 0) target.invalidate();
  }

  private getMdUnit(wellTrajectoryView: any) {
    return 'node.trajectory.mdUnit'
      .split('.')
      .reduce((p, c) => p?.[c], wellTrajectoryView as any);
  }
}
