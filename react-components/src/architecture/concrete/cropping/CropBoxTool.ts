/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../base/commands/BaseCommand';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { BoxOrLineEditTool } from '../box/BoxOrLineEditTool';
import { type PrimitiveType } from '../box/PrimitiveType';
import { BoxCreator } from '../box/BoxCreator';
import { CropBoxDomainObject } from './CropBoxDomainObject';
import { SetCropBoxCommand } from './SetCropBoxCommand';
import { ShowCropBoxOnTopCommand } from './ShowCropBoxOnTopCommand';

export class CropBoxTool extends BoxOrLineEditTool {
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
    return [new SetCropBoxCommand(), new ShowCropBoxOnTopCommand()];
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

  protected override canBeSelected(domainObject: DomainObject): boolean {
    return domainObject instanceof CropBoxDomainObject;
  }

  // ==================================================
  // OVERRIDES of BoxOrLineEditTool
  // ==================================================

  protected override createCreator(_primitiveType: PrimitiveType): BaseCreator | undefined {
    return new BoxCreator(new CropBoxDomainObject());
  }
}
