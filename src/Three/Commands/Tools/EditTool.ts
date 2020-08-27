import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import SelectCommandIcon from "@images/Commands/EditTool.png";
import { BaseManipulator } from "@/Three/Commands/Manipulators/BaseManipulator";
import { ManipulatorFactory } from "@/Three/Commands/Manipulators/ManipulatorFactory";

export class EditTool extends BaseTool
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _currentManipulator: BaseManipulator | null = null;

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null)
  {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  protected /*override*/ getTooltipCore(): string { return "Select or edit\nLeft button: Select or edit\nRight button: Pan \nWheel: Zoom\nLeft click: Pick to get information\nMouse hover: Pick to get information"; }

  public /*override*/ getName(): string { return "Edit"; }
  public /*override*/ getIcon(): string { return SelectCommandIcon; }

  //==================================================
  // OVERRIDES of BaseTool
  //==================================================

  public /*override*/ overrideLeftButton(): boolean { return true; }

  public /*override*/ onActivate(): void
  {
    const { target } = this;
    if (!target)
      return;

    const { viewInfo } = target;
    viewInfo.clear();
    viewInfo.addActiveTool(this);
    viewInfo.addValue("Left button drag", "Context dependent");
    viewInfo.addValue("Right button drag", "Move");
    viewInfo.addValue("Wheel", "Zoom in or out");
    viewInfo.addValue("Move hover", "Pick any object in 3D to get information");
    viewInfo.addValue("Left click", "Context dependent");
    target.invalidate();
  }

  public /*override*/ onMouseHover(event: MouseEvent): void
  {
    this.onShowInfo(event);
  }

  public /*override*/ onMouseDown(event: MouseEvent): void
  {
    // In case it is not finished
    if (this._currentManipulator)
    {
      this._currentManipulator.clear();
      this._currentManipulator = null;
    }
    const { target } = this;
    if (!target)
      return;

    const [node, intersection] = target.getNodeByMouseEvent(event);
    if (!node || !intersection)
      return;

    // Create the manipulator
    const manipulator = ManipulatorFactory.instance.create(node, target.className);
    if (!manipulator)
      return;

    const ray = target.getRayFromEvent(event);
    if (!manipulator.onMouseDown(target, node, intersection, ray))
      return;

    this._currentManipulator = manipulator;
  }

  public /*override*/ onMouseDrag(event: MouseEvent): void
  {
    const { target } = this;
    if (!target)
      return;

    if (!this._currentManipulator)
      return;

    const ray = target.getRayFromEvent(event);
    this._currentManipulator.onMouseDrag(target, ray, false);
  }

  public /*override*/ onMouseUp(event: MouseEvent): void
  {
    const { target } = this;
    if (!target)
      return;

    if (!this._currentManipulator)
      return;

    const ray = target.getRayFromEvent(event);
    this._currentManipulator.onMouseDrag(target, ray, true);
    this._currentManipulator.clear();
    this._currentManipulator = null;
  }
}
