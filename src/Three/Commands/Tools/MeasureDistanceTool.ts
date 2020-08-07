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

  public /*override*/ getName(): string { return "Measure distance"; }
  public /*override*/ getIcon(): string { return MeasureDistanceToolIcon; }
  public /*override*/ getTooltip(): string { return "Measure distance by click and drag to wantet position. You must hit a 3D object to see the distance."; }
  public /*override*/ getShortCutKeys(): string { return "M"; }

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
    viewInfo.addHeader(this.getName());
    viewInfo.addText("Click on a location in 3D to start from");

    target.invalidate();
    this._pixelCoordinates.clear();
    this._worldCoordinates.clear();
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
    const worldPosition = transformer.toWorld(intersection.point);

    point.z /= transformer.zScale;

    this._worldCoordinates.add(point);
    this._pixelCoordinates.add(pixel);

    const { viewInfo } = target;

    viewInfo.clear();
    viewInfo.addHeader(this.getName());
    if (this._worldCoordinates.length <= 1)
    {
      viewInfo.addText("Click on another location in 3D to end");
    }
    else
    {
      const sumDelta = this._worldCoordinates.getSumDelta();;
      viewInfo.addText("3D Distance", this._worldCoordinates.getLength().toFixed(2));
      viewInfo.addText("2D Distance", this._worldCoordinates.getLength(2).toFixed(2));
      viewInfo.addText("Sum Delta X", sumDelta.x.toFixed(2));
      viewInfo.addText("Sum Delta Y", sumDelta.y.toFixed(2));
      viewInfo.addText("Sum Delta Z", sumDelta.z.toFixed(2));
      viewInfo.addText("2D area", this._worldCoordinates.getArea().toFixed(2));
    }
    viewInfo.addText("Clicked Position", worldPosition.getString(2));
    viewInfo.setPolyline(this._pixelCoordinates);
    target.invalidate();
  }
}
