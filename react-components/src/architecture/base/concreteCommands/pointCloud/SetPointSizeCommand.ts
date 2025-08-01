import { type TranslationInput } from '../../utilities/TranslateInput';
import { BaseSliderCommand } from '../../commands/BaseSliderCommand';

const DEFAULT_POINT_SIZE = 2;
const MIN_POINT_SIZE = 0.0;
const MAX_POINT_SIZE = 4;
const STEP_POINT_SIZE = 0.1;

export class SetPointSizeCommand extends BaseSliderCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(MIN_POINT_SIZE, MAX_POINT_SIZE, STEP_POINT_SIZE);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'POINT_SIZE' };
  }

  public override get isEnabled(): boolean {
    return this.renderTarget.getPointClouds().next().value !== undefined;
  }

  public override get value(): number {
    // Let the first PointCloud decide the point size
    const pointCloud = this.renderTarget.getPointClouds().next().value;
    return pointCloud?.pointSize ?? DEFAULT_POINT_SIZE;
  }

  public override set value(value: number) {
    for (const pointCloud of this.renderTarget.getPointClouds()) {
      pointCloud.pointSize = value;
    }
  }
}
