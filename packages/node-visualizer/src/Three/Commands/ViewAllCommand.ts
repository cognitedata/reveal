import ViewAllCommandIcon from '../../images/Commands/ViewAllCommand.png';
import { ThreeRenderTargetCommand } from '../Commands/ThreeRenderTargetCommand';
import { ThreeRenderTargetNode } from '../Nodes/ThreeRenderTargetNode';

export class ViewAllCommand extends ThreeRenderTargetCommand {
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
    return 'View all';
  }

  public /* override */ getIcon(): string {
    return ViewAllCommandIcon;
  }

  protected /* override */ invokeCore(): boolean {
    if (!this.target) return false;

    this.target.viewAll();
    return true;
  }
}
