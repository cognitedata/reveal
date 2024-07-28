/*!
 * Copyright 2024 Cognite AS
 */

import { CognitePointCloudModel, PointShape } from '@cognite/reveal';
import { BaseOptionCommand } from '../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type TranslateKey } from '../utilities/TranslateKey';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';

const DEFAULT_OPTIONS: PointShape[] = [PointShape.Circle, PointShape.Square, PointShape.Paraboloid];

export class SetPointShapeCommand extends BaseOptionCommand {
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
    return { key: 'POINT_SHAPE', fallback: 'Point shape' };
  }

  public override get isEnabled(): boolean {
    return getPointClouds(this.renderTarget).next().value !== undefined;
  }
}

// Note: This is not exported, as it is only used internally

class OptionCommand extends RenderTargetCommand {
  private readonly _value: PointShape;

  public constructor(value: PointShape) {
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
      return false;
    }
    return pointCloud.pointSizeType === this._value;
  }

  public override invokeCore(): boolean {
    for (const pointCloud of getPointClouds(this.renderTarget)) {
      pointCloud.pointShape = this._value;
    }
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

function getTranslateKey(type: PointShape): TranslateKey {
  switch (type) {
    case PointShape.Circle:
      return { key: 'CIRCLE', fallback: 'Circle' };
    case PointShape.Square:
      return { key: 'SQUARE', fallback: 'Square' };
    case PointShape.Paraboloid:
      return { key: 'PARABOLOID', fallback: 'Paraboloid' };
  }
}
