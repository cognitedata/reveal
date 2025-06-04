import { PointColorType } from '@cognite/reveal';
import { BaseOptionCommand } from '../../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';

const DEFAULT_OPTIONS: PointColorType[] = [
  PointColorType.Rgb,
  PointColorType.Classification,
  PointColorType.Depth,
  PointColorType.Height,
  PointColorType.Intensity
];

export class SetPointColorTypeCommand extends BaseOptionCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor(supportedTypes = DEFAULT_OPTIONS) {
    super();
    for (const value of supportedTypes) {
      this.add(new OptionItemCommand(value));
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'POINT_COLOR' };
  }

  public override get isEnabled(): boolean {
    return this.renderTarget.getPointClouds().next().value !== undefined;
  }
}

// Note: This is not exported, as it is only used internally

class OptionItemCommand extends RenderTargetCommand {
  private readonly _value: PointColorType;

  public constructor(value: PointColorType) {
    super();
    this._value = value;
  }

  public override get tooltip(): TranslationInput {
    return getTranslateKey(this._value);
  }

  public override get isChecked(): boolean {
    // Let the first PointCloud decide the color type
    const pointCloud = this.renderTarget.getPointClouds().next().value;
    if (pointCloud === undefined) {
      return false;
    }
    return pointCloud.pointColorType === this._value;
  }

  public override invokeCore(): boolean {
    for (const pointCloud of this.renderTarget.getPointClouds()) {
      pointCloud.pointColorType = this._value;
    }
    return true;
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function getTranslateKey(type: PointColorType): TranslationInput {
  switch (type) {
    case PointColorType.Rgb:
      return { key: 'RGB' };
    case PointColorType.Depth:
      return { key: 'DEPTH' };
    case PointColorType.Height:
      return { key: 'HEIGHT' };
    case PointColorType.Classification:
      return { key: 'CLASSIFICATION' };
    case PointColorType.Intensity:
      return { key: 'INTENSITY' };
    case PointColorType.LevelOfDetail:
      return { untranslated: 'LevelOfDetail' };
    case PointColorType.PointIndex:
      return { untranslated: 'PointIndex' };
    default:
      return { untranslated: 'Unknown' };
  }
}
