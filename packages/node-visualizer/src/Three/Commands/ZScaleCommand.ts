import { ThreeRenderTargetNode } from 'Three/Nodes/ThreeRenderTargetNode';
import { ThreeRenderTargetCommand } from 'Three/Commands/ThreeRenderTargetCommand';
import { Util } from 'Core/Primitives/Util';

export class ZScaleCommand extends ThreeRenderTargetCommand {
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
    return 'Set Z-scale';
  }

  public /* override */ getName(): string {
    return 'Scale Z';
  }

  public get /* override */ isDropdown(): boolean {
    return true;
  }

  public get /* override */ dropdownOptions(): string[] {
    return [
      '0.1',
      '0.25',
      '0.5',
      '1',
      '1.5',
      '2',
      '2.5',
      '3',
      '4',
      '5',
      '7.5',
      '10',
      '20',
      '50',
      '100',
    ];
  }

  public get /* override */ value(): string {
    return !this.target ? '' : this.target.zScale.toString();
  }

  protected /* override */ invokeCore(): boolean {
    return true;
  }

  protected /* override */ invokeValueCore(value: string): boolean {
    if (!this.target) return false;

    if (Util.getNumber(value) <= 0) return false;

    this.target.zScale = Util.getNumber(value);
    return true;
  }
}
