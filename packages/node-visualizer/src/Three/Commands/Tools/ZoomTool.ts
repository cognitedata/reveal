import ZoomBaseToolIcon from '../../../images/Commands/ZoomTool.png';
import { BaseTool } from '../../Commands/Tools/BaseTool';
import { ThreeRenderTargetNode } from '../../Nodes/ThreeRenderTargetNode';

export class ZoomTool extends BaseTool {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  public /* override */ getName(): string {
    return 'Rectangle zoom';
  }

  public /* override */ getIcon(): string {
    return ZoomBaseToolIcon;
  }

  protected /* override */ getTooltipCore(): string {
    return `${this.getDisplayName()}\n` + 'Not implemented yet.';
  }

  //= =================================================
  // OVERRIDES of BaseTool
  //= =================================================

  public /* override */ onActivate(): void {
    const { target } = this;
    if (!target) return;

    const { viewInfo } = target;
    viewInfo.clear();
    viewInfo.addActiveTool(this);
    target.invalidate();
  }
}
