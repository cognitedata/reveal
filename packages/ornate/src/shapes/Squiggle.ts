import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';

const DEFAULT_SQUIGGLE_STEP = 25;
const DEFAULT_SQUIGGLE_AMPLITUDE = 25;

type SquiggleConfig = Omit<ShapeConfig, 'sceneFunc'> & {
  step?: number;
  amplitude?: number;
};

export default class Squiggle extends Konva.Shape<SquiggleConfig> {
  private step: number;
  private amplitude: number;

  constructor(config: SquiggleConfig) {
    super(config);
    this.step = config.step ?? DEFAULT_SQUIGGLE_STEP;
    this.amplitude = config.amplitude ?? DEFAULT_SQUIGGLE_AMPLITUDE;
  }

  // eslint-disable-next-line no-underscore-dangle
  _sceneFunc(context: Konva.Context, shape: Konva.Shape) {
    context.beginPath();
    // Overshooting the bounding box can have negative UX-implications, such
    // as making it more difficult to resize, so we never want to overshoot.
    let POINTER_X = this.amplitude / 2;
    let POINTER_Y = this.amplitude / 2;
    context.moveTo(POINTER_X, POINTER_Y);
    const HORIZONTAL_STEPS = Math.max(
      1,
      Math.floor((shape.width() - this.amplitude) / this.step)
    );
    const VERTICAL_STEPS = Math.max(
      1,
      Math.floor((shape.height() - this.amplitude) / this.step)
    );

    // EAST
    for (let i = 0; i < HORIZONTAL_STEPS; i++) {
      context.quadraticCurveTo(
        POINTER_X + this.step / 2,
        POINTER_Y - this.amplitude / 2,
        POINTER_X + this.step,
        POINTER_Y
      );
      POINTER_X += this.step;
    }

    // SOUTH
    for (let i = 0; i < VERTICAL_STEPS; i++) {
      context.quadraticCurveTo(
        POINTER_X + this.amplitude / 2,
        POINTER_Y + this.step / 2,
        POINTER_X,
        POINTER_Y + this.step
      );
      POINTER_Y += this.step;
    }

    // WEST
    for (let i = 0; i < HORIZONTAL_STEPS; i++) {
      context.quadraticCurveTo(
        POINTER_X - this.step / 2,
        POINTER_Y + this.amplitude / 2,
        POINTER_X - this.step,
        POINTER_Y
      );
      POINTER_X -= this.step;
    }

    // NORTH
    for (let i = 0; i < VERTICAL_STEPS; i++) {
      context.quadraticCurveTo(
        POINTER_X - this.amplitude / 2,
        POINTER_Y - this.step / 2,
        POINTER_X,
        POINTER_Y - this.step
      );
      POINTER_Y -= this.step;
    }

    context.closePath();
    context.fillStrokeShape(shape);
  }
}
