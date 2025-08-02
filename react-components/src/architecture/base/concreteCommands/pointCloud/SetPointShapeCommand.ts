import { PointShape } from '@cognite/reveal';
import { BaseOptionCommand } from '../../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { PointCloudDomainObject } from '../../../concrete/reveal/pointCloud/PointCloudDomainObject';
import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';

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

  public override get tooltip(): TranslationInput {
    return { key: 'POINT_SHAPE' };
  }

  public override get isEnabled(): boolean {
    return this.rootDomainObject.getDescendantByType(PointCloudDomainObject) !== undefined;
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.addEffect(() => {
      this.settingsController.pointShape();
      this.update();
    });
  }
}

// Note: This is not exported, as it is only used internally

class OptionItemCommand extends RenderTargetCommand {
  private readonly _value: PointShape;

  public constructor(value: PointShape) {
    super();
    this._value = value;
  }

  public override get tooltip(): TranslationInput {
    switch (this._value) {
      case PointShape.Circle:
        return { key: 'CIRCLE' };
      case PointShape.Square:
        return { key: 'SQUARE' };
      case PointShape.Paraboloid:
        return { key: 'PARABOLOID' };
      default:
        throw new Error(`Unknown point shape`);
    }
  }

  public override get isChecked(): boolean {
    return this.settingsController.pointShape() === this._value;
  }

  public override invokeCore(): boolean {
    this.settingsController.pointShape(this._value);
    return true;
  }
}
