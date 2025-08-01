import { type TranslationInput } from '../../utilities/TranslateInput';
import { BaseSliderCommand } from '../../commands/BaseSliderCommand';
import { PointCloudDomainObject } from '../../../concrete/reveal/pointCloud/PointCloudDomainObject';

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
    return this.rootDomainObject.getDescendantByType(PointCloudDomainObject) !== undefined;
  }

  public override get value(): number {
    return this.renderTarget.revealSettingsController.pointSize();
  }

  public override set value(value: number) {
    this.renderTarget.revealSettingsController.pointSize(value);
  }
}
