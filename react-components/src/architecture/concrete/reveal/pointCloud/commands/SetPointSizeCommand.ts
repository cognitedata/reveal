import { type TranslationInput } from '../../../../base/utilities/translation/TranslateInput';
import { BaseSliderCommand } from '../../../../base/commands/BaseSliderCommand';
import { PointCloudDomainObject } from '../PointCloudDomainObject';
import { type RevealRenderTarget } from '../../../../base/renderTarget/RevealRenderTarget';

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
    return this.root.getDescendantByType(PointCloudDomainObject) !== undefined;
  }

  public override get value(): number {
    return this.settingsController.pointSize();
  }

  public override set value(value: number) {
    this.settingsController.pointSize(value);
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.listenTo(this.settingsController.pointSize);
  }
}
