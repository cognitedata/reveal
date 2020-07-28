import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";

export class ZScaleCommand extends ThreeRenderTargetCommand
{

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null)
  {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ getName(): string { return "Scale Z" }
  public /*override*/ get isDropdown (): boolean { return true; }
  public /*override*/ get dropdownOptions(): string[] { return ["0.1", "0.25", "0.5", "1", "2", "3", "4", "5", "7.5", "10", "20", "50", "100"]; }


  protected /*override*/ invokeCore(): boolean
  {
    return true;
  }

  protected /*override*/ invokeValueCore(value: string): boolean
  {
    // tslint:disable-next-line:no-console
    console.log(`Z Scale value: ${value}`);
    // call setZScale(value) here
    return true;
  }
}
