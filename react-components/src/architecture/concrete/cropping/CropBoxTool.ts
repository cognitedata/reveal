/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../base/commands/BaseCommand';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PrimitiveEditTool } from '../primitives/PrimitiveEditTool';
import { type PrimitiveType } from '../primitives/PrimitiveType';
import { BoxCreator } from '../primitives/box/BoxCreator';
import { CropBoxDomainObject } from './CropBoxDomainObject';
import { CropCommand } from './CropCommand';
import { ShowCropBoxOnTopCommand } from './commands/ShowCropBoxOnTopCommand';
import { ShowAllCropBoxesCommand } from './commands/ShowAllCropBoxesCommand';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';

export class CropBoxTool extends PrimitiveEditTool {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return 'Crop';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'CROP_BOX', fallback: 'Create or edit crop box' };
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [new CropCommand(), new ShowCropBoxOnTopCommand(), new ShowAllCropBoxesCommand()];
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onActivate(): void {
    super.onActivate();
    this.setAllVisible(true);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    this.setAllVisible(false);
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof CropBoxDomainObject;
  }

  // ==================================================
  // OVERRIDES of BoxOrLineEditTool
  // ==================================================

  protected override createCreator(_primitiveType: PrimitiveType): BaseCreator | undefined {
    return new BoxCreator(new CropBoxDomainObject());
  }
}
