import { PointShape } from '@cognite/reveal';
import { BaseOptionCommand } from '../../commands/BaseOptionCommand';
import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { PointCloudDomainObject } from '../../../concrete/reveal/pointCloud/PointCloudDomainObject';
import { first } from '../../utilities/extensions/generatorUtils';

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
    return first(this.rootDomainObject.getDescendantsByType(PointCloudDomainObject)) !== undefined;
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
    // Let the first PointCloud decide the color type
    const domainObject = first(this.getDomainObjects());
    if (domainObject === undefined) {
      return false;
    }
    return domainObject.pointShape() === this._value;
  }

  public override invokeCore(): boolean {
    for (const domainObject of this.getDomainObjects()) {
      domainObject.pointShape(this._value);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private *getDomainObjects(): Generator<PointCloudDomainObject> {
    yield* this.rootDomainObject.getDescendantsByType(PointCloudDomainObject);
  }
}
