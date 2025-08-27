import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type IconName, type ButtonType } from '../../../base/utilities/types';
import { type TranslationInput } from '../../../base/utilities/translation/TranslateInput';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';

export class AnnotationsDeleteCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Delete selected annotations' };
  }

  public override get icon(): IconName {
    return 'Delete';
  }

  public override get buttonType(): ButtonType {
    return 'ghost-destructive';
  }

  public override get isEnabled(): boolean {
    const domainObject = this.getAnnotationsDomainObject();
    return (
      domainObject !== undefined &&
      domainObject.selectedAnnotation !== undefined &&
      domainObject.selectedAnnotation.selectedPrimitive !== undefined
    );
  }

  protected override invokeCore(): boolean {
    const domainObject = this.getAnnotationsDomainObject();
    if (domainObject === undefined) {
      return false;
    }
    return domainObject.removeSelectedAnnotationInteractive();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getAnnotationsDomainObject(): AnnotationsDomainObject | undefined {
    return this.rootDomainObject.getSelectedDescendantByType(AnnotationsDomainObject);
  }
}
