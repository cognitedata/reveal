import { type TranslationInput } from '../../../../base/utilities/translation/TranslateInput';
import { BaseSliderCommand } from '../../../../base/commands/BaseSliderCommand';
import { PointCloudDomainObject } from '../PointCloudDomainObject';
import { type RevealRenderTarget } from '../../../../base/renderTarget/RevealRenderTarget';
import { translate } from '../../../../base/utilities/translation/translateUtils';

export const POINT_SIZES = [
  0, 0.025, 0.05, 0.075, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2, 2.5, 3, 4
];

export class SetPointSizeCommand extends BaseSliderCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(0, POINT_SIZES.length - 1, 1);
  }

  public override getValueLabel(): string {
    const value = this.settingsController.pointSize();
    if (value === 0) {
      return translate({ key: 'MINIMUM' });
    }
    return value.toString();
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
    const value = this.pointSize;
    const index = POINT_SIZES.findIndex((size) => size === value);
    if (index >= 0) {
      return index;
    }
    return getClosestIndex(POINT_SIZES, value);
  }

  public override set value(index: number) {
    if (index >= 0 && index < POINT_SIZES.length) {
      this.pointSize = POINT_SIZES[index];
    }
  }

  public get pointSize(): number {
    return this.settingsController.pointSize();
  }

  public set pointSize(value: number) {
    this.settingsController.pointSize(value);
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.listenTo(this.settingsController.pointSize);
  }
}

function getClosestIndex(array: number[], value: number): number {
  return array.reduce(
    (bestIndex, size, index, array) =>
      Math.abs(size - value) < Math.abs(array[bestIndex] - value) ? index : bestIndex,
    0
  );
}
