/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from '../../base/commands/BaseCommand';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PrimitiveEditTool } from '../primitives/PrimitiveEditTool';
import { PrimitiveType } from '../primitives/PrimitiveType';
import { BoxCreator } from '../primitives/box/BoxCreator';
import { CropBoxDomainObject } from './CropBoxDomainObject';
import { ClipCommand } from './commands/ClipCommand';
import { ShowClippingOnTopCommand } from './commands/ShowClippingOnTopCommand';
import { ShowAllClippingCommand } from './commands/ShowAllClippingCommand';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { SetClipTypeCommand } from './commands/SetClipTypeCommand';
import { PlaneCreator } from '../primitives/plane/PlaneCreator';
import { SliceDomainObject } from './SliceDomainObject';

export class ClipTool extends PrimitiveEditTool {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(PrimitiveType.None);
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
    return [
      new SetClipTypeCommand(PrimitiveType.XPlane),
      new SetClipTypeCommand(PrimitiveType.YPlane),
      new SetClipTypeCommand(PrimitiveType.ZPlane),
      new SetClipTypeCommand(PrimitiveType.XYPlane),
      new SetClipTypeCommand(PrimitiveType.Box),
      undefined, // Separator
      new ClipCommand(),
      new ShowClippingOnTopCommand(),
      new ShowAllClippingCommand()
    ];
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onActivate(): void {
    super.onActivate();
    //  this.setAllVisible(true);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    //    this.setAllVisible(false);
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof CropBoxDomainObject || domainObject instanceof SliceDomainObject;
  }

  // ==================================================
  // OVERRIDES of BoxOrLineEditTool
  // ==================================================

  protected override createCreator(): BaseCreator | undefined {
    switch (this.primitiveType) {
      case PrimitiveType.XPlane:
      case PrimitiveType.YPlane:
      case PrimitiveType.ZPlane:
      case PrimitiveType.XYPlane:
        return new PlaneCreator(new SliceDomainObject(this.primitiveType));

      case PrimitiveType.Box:
        return new BoxCreator(new CropBoxDomainObject());
      default:
        return undefined;
    }
  }
}
