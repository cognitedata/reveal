import { ThreeRenderTargetCommand } from './ThreeRenderTargetCommand';
import { ThreeRenderTargetNode } from '../Nodes/ThreeRenderTargetNode';
import { ViewModes } from '../Nodes/ViewModes';

export class ViewModeCommand extends ThreeRenderTargetCommand {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  protected /* override */ getTooltipCore(): string {
    return 'Set View Mode';
  }

  public /* override */ getName(): string {
    return 'View Mode';
  }

  public get /* override */ isDropdown(): boolean {
    return true;
  }

  public get /* override */ dropdownOptions(): string[] {
    return Object.values(ViewModes);
  }

  public get /* override */ value(): string {
    return !this.target ? '' : this.target.viewMode;
  }

  protected /* override */ invokeCore(): boolean {
    return true;
  }

  protected /* override */ invokeValueCore(value: ViewModes): boolean {
    if (!this.target) return false;

    this.target.viewMode = value;
    return true;
  }
}
