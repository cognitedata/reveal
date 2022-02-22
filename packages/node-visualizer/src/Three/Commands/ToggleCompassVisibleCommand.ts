import { CompassNode } from '../../Core/Nodes/Decorations/CompassNode';
import ToggleCompassVisibleCommandIcon from '../../images/Commands/ToggleCompassVisibleCommand.png';
import { ThreeRenderTargetCommand } from '../Commands/ThreeRenderTargetCommand';
import { ThreeRenderTargetNode } from '../Nodes/ThreeRenderTargetNode';

export class ToggleCompassVisibleCommand extends ThreeRenderTargetCommand {
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
    return 'Hide or show North Arrow';
  }

  public /* override */ getIcon(): string {
    return ToggleCompassVisibleCommandIcon;
  }

  public get /* override */ isCheckable(): boolean {
    return true;
  }

  public get /* override */ isChecked(): boolean {
    return this.target ? this.target.hasViewOfNodeType(CompassNode) : false;
  }

  protected /* override */ invokeCore(): boolean {
    if (!this.target) return false;

    for (const node of this.target.root.getDescendantsByType(CompassNode))
      node.toggleVisibleInteractive(this.target);
    return true;
  }
}
