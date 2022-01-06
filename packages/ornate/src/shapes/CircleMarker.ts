import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';

const DEFAULT_RADIUS = 10;

type CircleMarkerConfig = Omit<ShapeConfig, 'sceneFunc'> & {
  radius?: number;
  number: number;
  pinnedTo?: {
    x: number;
    y: number;
  };
};

const PIN_PEAK_MULTIPLIER = 2.75;

export default class CircleMarker extends Konva.Shape<CircleMarkerConfig> {
  private readonly radius: number;
  private readonly number: number;
  readonly color: string;

  constructor({
    color = 'black',
    radius = DEFAULT_RADIUS,
    number,
    ...config
  }: CircleMarkerConfig) {
    super({
      stroke: color,
      strokeWidth: Math.round(radius / 4),
      ...config,
      ...(config.pinnedTo
        ? {
            x: config.pinnedTo.x - radius,
            y: config.pinnedTo.y - 3 * radius,
          }
        : {}),
      radius,
      number,
    });
    this.color = color;
    this.radius = radius;
    this.number = number;
  }

  getWidth() {
    return this.radius * 2;
  }
  getHeight() {
    // Note: This will produce non-perfect results for other
    // PIN_PEAK_MULTIPLIER values, but since this constant is not
    // supposed to be changed, calculating the real size of the miter is
    // left as an exercise for the reader.
    const shamefulMiterOffset = this.strokeWidth() / 2;
    return this.radius * PIN_PEAK_MULTIPLIER + shamefulMiterOffset;
  }

  // eslint-disable-next-line no-underscore-dangle
  _sceneFunc(context: Konva.Context & CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.radius, this.radius, this.radius, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    context.fillStrokeShape(this);

    const DIFF_RADIAN = 0.22;
    const CIRCLE_MID_X = this.radius;
    const CIRCLE_MID_Y = this.radius;

    const RIGHT_ANGLE_X =
      this.radius * Math.cos(DIFF_RADIAN * Math.PI) + CIRCLE_MID_X;
    const RIGHT_ANGLE_Y =
      this.radius * Math.sin((1 - DIFF_RADIAN) * Math.PI) + CIRCLE_MID_Y;

    context.beginPath();
    context.arc(
      this.radius,
      this.radius,
      this.radius,
      DIFF_RADIAN * Math.PI,
      (1 - DIFF_RADIAN) * Math.PI
    );

    context.lineTo(this.radius, PIN_PEAK_MULTIPLIER * this.radius);
    context.lineTo(RIGHT_ANGLE_X, RIGHT_ANGLE_Y);
    context.fillStyle = this.color;
    context.fill();

    context.font = `bold ${Math.round(0.8 * this.radius)}px Sans-Serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = this.color;
    context.fillText(`${this.number}`, this.radius, this.radius);
    context.fillStrokeShape(this);
  }
}
