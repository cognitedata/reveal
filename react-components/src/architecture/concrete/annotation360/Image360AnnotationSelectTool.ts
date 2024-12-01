/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type IconName } from '../../base/utilities/IconName';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { EDIT_WITHOUT_IMAGE } from './constants';

export class Image360AnnotationSelectTool extends BaseEditTool {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return 'Cursor';
  }

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Select 360 polygons' };
  }

  public override get isEnabled(): boolean {
    return EDIT_WITHOUT_IMAGE ? true : this.renderTarget.isInside360Image;
  }

  public override update(): void {
    super.update();
    if (this.isChecked && !this.isEnabled) {
      this.renderTarget.commandsController.activateDefaultTool();
    }
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override get defaultCursor(): string {
    return 'default';
  }

  public override onActivate(): void {
    const imageId = this.renderTarget.active360ImageId;
    if (imageId !== undefined) {
      for (const domainObject of this.getSelectable()) {
        if (
          domainObject instanceof Image360AnnotationDomainObject &&
          domainObject.connectedImageId === imageId
        ) {
          domainObject.setVisibleInteractive(true, this.renderTarget);
        }
      }
    }
    super.onActivate();
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (intersection !== undefined) {
      const domainObject = this.getIntersectedSelectableDomainObject(intersection);
      if (domainObject !== undefined) {
        this.deselectAll(domainObject);
        domainObject.setSelectedInteractive(true);
        return;
      }
    }
    // Click in the "air"
    this.deselectAll();
    await super.onClick(event);
  }

  public override onDeleteKey(): void {
    const domainObjectsToDelete = Array.from(this.getAllSelected());
    for (const domainObject of domainObjectsToDelete) {
      this.addTransaction(domainObject.createTransaction(Changes.deleted));
      domainObject.removeInteractive();
    }
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof Image360AnnotationDomainObject;
  }
}
