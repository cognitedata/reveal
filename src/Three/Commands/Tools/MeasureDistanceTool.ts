import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import MeasureDistanceToolIcon from "@images/Commands/MeasureDistanceTool.png";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { Polyline } from "@/Core/Geometry/Polyline";
import { Vector3 } from "@/Core/Geometry/Vector3";

export class MeasureDistanceTool extends BaseTool
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _pixelCoordinates: Polyline = new Polyline();
  private _worldCoordinates: Polyline = new Polyline();

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

  protected /*override*/ getTooltipCore(): string { return "Measure distance by click and drag to wantet position. You must hit a 3D object to see the distance."; }

  public /*override*/ getName(): string { return "Measure distance"; }
  public /*override*/ getIcon(): string { return MeasureDistanceToolIcon; }
  public /*override*/ getShortCutKeys(): string { return "m"; }

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
    viewInfo.addText("Click on a location in 3D to start from");

    target.invalidate();
    this._pixelCoordinates.clear();
    this._worldCoordinates.clear();
  }

  public /*override*/ onKeyDown(event: KeyboardEvent): void
  {
    if (event.code === "Escape")
    {
      this.onActivate(); // Reactive it
    }
  }

  public /*override*/ onDeactivate(): void
  {
    this._pixelCoordinates.clear();
    this._worldCoordinates.clear();
  }

  public /*override*/ onMouseDown(event: MouseEvent): void
  {
    const { target } = this;
    if (!target)
      return;

    const [view, intersection] = target.getViewByMouseEvent(event);
    if (!view || !intersection)
      return;

    const { transformer } = target;
    const pixel = new Vector3(event.offsetX, event.offsetY, 0);
    const point = ThreeConverter.fromThreeVector3(intersection.point);

    point.z /= transformer.zScale;

    this._worldCoordinates.add(point);
    this._pixelCoordinates.add(pixel);

    const worldStartPosition = this._worldCoordinates.list[0].clone();
    worldStartPosition.add(transformer.translation);

    const { viewInfo } = target;

    viewInfo.clear();
    viewInfo.addActiveTool(this);
    if (this._worldCoordinates.length <= 1)
    {
      viewInfo.addText("Click on another location in 3D to end");
      viewInfo.addValue("Start Position", worldStartPosition.getString(2));
    }
    else
    {
      const worldEndPosition = this._worldCoordinates.list[this._worldCoordinates.length - 1].clone();
      worldEndPosition.add(transformer.translation);

      const sumDelta = this._worldCoordinates.getSumDelta();;
      viewInfo.addValue("2D / 3D distance", `${this._worldCoordinates.getLength(2).toFixed(2)} / ${this._worldCoordinates.getLength(3).toFixed(2)}`);
      viewInfo.addValue("Sum delta X,Y,Z", sumDelta.getString(2));
      viewInfo.addValue("2D area", this._worldCoordinates.getArea().toFixed(2));
      viewInfo.addValue("Start Position", worldStartPosition.getString(2));
      viewInfo.addValue("End Position", worldEndPosition.getString(2));
    }
    viewInfo.setPolyline(this._pixelCoordinates);
    target.invalidate();
  }
}
