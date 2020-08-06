import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import SelectCommandIcon from "@images/Commands/SelectCommand.png";
import { BaseManipulator } from '@/Three/Commands/Manipulators/BaseManipulator';
import { ManipulatorFactory } from '@/Three/Commands/Manipulators/ManipulatorFactory';

export class EditTool extends BaseTool
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _currentManipulator: BaseManipulator | null = null;

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

  public /*override*/ getName(): string { return "Select, edit or pick"; }
  public /*override*/ getIcon(): string { return SelectCommandIcon; }

  //==================================================
  // OVERRIDES of ToolCommand
  //==================================================

  public /*override*/ overrideLeftButton(): boolean { return true; }

  public /*override*/ onMouseHover(event: MouseEvent): void
  {
    const { target } = this;
    if (!target)
      return;

    const { viewInfo } = target;
    const preCount = viewInfo.items.length;
    viewInfo.clearItems();

    const [view, intersection] = target.getViewByMouseEvent(event);
    if (view && intersection)
      view.onShowInfo(viewInfo, intersection);

    const postCount = viewInfo.items.length;
    if (preCount > 0 || postCount > 0)
      target.invalidate();
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
