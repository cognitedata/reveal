/*!
 * Copyright 2024 Cognite AS
 */

import { CognitePointCloudModel } from '@cognite/reveal';
import { type TranslateKey } from '../utilities/TranslateKey';
import { BaseSliderCommand } from '../commands/BaseSliderCommand';

export const DEFAULT_POINT_SIZE = 2;
export const MIN_POINT_SIZE = 0.0;
export const MAX_POINT_SIZE = 4; // Default seems be be 2, but the user probably wants lower values
export const STEP_POINT_SIZE = 0.1;

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

  public override get tooltip(): TranslateKey {
    return { key: 'POINT_SIZE', fallback: 'Point size' };
  }

  public override get isEnabled(): boolean {
    for (const model of this.renderTarget.viewer.models) {
      if (model instanceof CognitePointCloudModel) {
        return true;
      }
    }
    return false;
  }

  public override get value(): number {
    for (const model of this.renderTarget.viewer.models) {
      if (model instanceof CognitePointCloudModel) {
        return model.pointSize;
      }
    }
    return DEFAULT_POINT_SIZE;
  }

  public override set value(value: number) {
    for (const model of this.renderTarget.viewer.models) {
      if (model instanceof CognitePointCloudModel) {
        model.pointSize = value;
      }
    }
  }
}
