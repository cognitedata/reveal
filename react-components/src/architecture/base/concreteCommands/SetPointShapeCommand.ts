/*!
 * Copyright 2024 Cognite AS
 */

import { PointShape } from '@cognite/reveal';
import { BaseOptionCommand } from '../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../commands/RenderTargetCommand';
import { type TranslateKey } from '../utilities/TranslateKey';

const DEFAULT_OPTIONS: PointShape[] = [PointShape.Circle, PointShape.Square, PointShape.Paraboloid];

export class SetPointShapeCommand extends BaseOptionCommand {
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

  public override get tooltip(): TranslateKey {
    return { key: 'POINT_SHAPE', fallback: 'Point shape' };
  }

  public override get isEnabled(): boolean {
    return this.renderTarget.getPointClouds().next().value !== undefined;
  }
}

// Note: This is not exported, as it is only used internally

class OptionItemCommand extends RenderTargetCommand {
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
    const pointCloud = this.renderTarget.getPointClouds().next().value;
    if (pointCloud === undefined) {
      return false;
    }
    return pointCloud.pointSizeType === this._value;
  }

  public override invokeCore(): boolean {
    for (const pointCloud of this.renderTarget.getPointClouds()) {
      pointCloud.pointShape = this._value;
    }
    return true;
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

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
