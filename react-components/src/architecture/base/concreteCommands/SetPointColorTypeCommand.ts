/*!
 * Copyright 2024 Cognite AS
 */

import { CognitePointCloudModel, PointColorType } from '@cognite/reveal';
import { BaseOptionCommand } from '../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type TranslateKey } from '../utilities/TranslateKey';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';

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
      this.add(new OptionCommand(value));
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'POINT_COLOR', fallback: 'Point color' };
  }

  public override get isEnabled(): boolean {
    return true;
    return getPointClouds(this.renderTarget).next().value !== undefined;
  }
}

// Note: This is not exported, as it is only used internally

class OptionCommand extends RenderTargetCommand {
  static selectedValue = PointColorType.Rgb; // For debugging only
  private readonly _value: PointColorType;

  public constructor(value: PointColorType) {
    super();
    this._value = value;
  }

  public override get tooltip(): TranslateKey {
    return getTranslateKey(this._value);
  }

  public override get isChecked(): boolean {
    // Let the first PointCloud decide the color type
    const pointCloud = getPointClouds(this.renderTarget).next().value;
    if (pointCloud === undefined) {
      return OptionCommand.selectedValue === this._value;
    }
    return pointCloud.pointColorType === this._value;
  }

  public override invokeCore(): boolean {
    for (const pointCloud of getPointClouds(this.renderTarget)) {
      pointCloud.pointColorType = this._value;
    }
    OptionCommand.selectedValue = this._value;
    return true;
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function* getPointClouds(renderTarget: RevealRenderTarget): Generator<CognitePointCloudModel> {
  for (const model of renderTarget.viewer.models) {
    if (model instanceof CognitePointCloudModel) {
      yield model;
    }
  }
}

function getTranslateKey(type: PointColorType): TranslateKey {
  switch (type) {
    case PointColorType.Rgb:
      return { key: 'RGB', fallback: 'RGB' };
    case PointColorType.Depth:
      return { key: 'DEPTH', fallback: 'Depth' };
    case PointColorType.Height:
      return { key: 'HEIGHT', fallback: 'Height' };
    case PointColorType.Classification:
      return { key: 'CLASSIFICATION', fallback: 'Classification' };
    case PointColorType.Intensity:
      return { key: 'INTENSITY', fallback: 'Intensity' };
    case PointColorType.LevelOfDetail:
      return { key: 'LEVEL_OF_DETAIL', fallback: 'LevelOfDetail' };
    case PointColorType.PointIndex:
      return { key: 'POINT_INDEX', fallback: 'PointIndex' };
    default:
      return { key: 'UNKNOWN', fallback: 'Unknown' };
  }
}
