import { BoxDomainObject } from '../primitives/box/BoxDomainObject';
import { Color } from 'three';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type AnnotationsDomainObject } from './AnnotationsDomainObject';
import { SolidDomainObject } from '../primitives/common/SolidDomainObject';
import { SolidPrimitiveRenderStyle } from '../primitives/common/SolidPrimitiveRenderStyle';
import { AnnotationChangedDescription } from './helpers/AnnotationChangedDescription';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { CopyToClipboardCommand } from '../../base/concreteCommands/CopyToClipboardCommand';
import { CycleLengthUnitsCommand } from '../../base/concreteCommands/units/CycleLengthUnitsCommand';
import { Box } from '../../base/utilities/primitives/Box';
import { Annotation } from './helpers/Annotation';

export class BoxGizmoDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.color = new Color(Color.NAMES.white);
  }
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslationInput {
    return { key: 'BOX' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new SolidPrimitiveRenderStyle();
    style.showLabel = false;
    style.solidOpacity = 0.3333;
    return style;
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new BoxGizmoDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }

  protected override notifyCore(change: DomainObjectChange): void {
    super.notifyCore(change);

    // Update the selected annotation if the gizmo is moved
    const desc = change.getChangedDescription(Changes.geometry);
    if (desc !== undefined && !desc.isChanged(SolidDomainObject.GizmoOnly)) {
      this.updateSelectedAnnotationFromThis(false);
    } else if (change.isChanged(Changes.dragging)) {
      this.updateSelectedAnnotationFromThis(true);
    }
  }

  public override getPanelToolbar(): BaseCommand[] {
    return [new CopyToClipboardCommand(), new CycleLengthUnitsCommand()];
  }

  public override get isVisibleInTree(): boolean {
    return false;
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  public override get useClippingInIntersection(): boolean {
    return false;
  }

  // ==================================================
  // OVERRIDES of BoxDomainObject
  // ==================================================

  public override canRotateComponent(_component: number): boolean {
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public createAnnotation(): Annotation {
    const box = new Box();
    box.copy(this.box);
    return Annotation.create(box);
  }

  public updateThisFromAnnotation(annotation: Annotation): boolean {
    const box = annotation.selectedPrimitive;
    if (!(box instanceof Box)) {
      return false;
    }
    this.box.copy(box);
    return true;
  }

  private updateSelectedAnnotationFromThis(inDragging: boolean): boolean {
    const annotationDomainObject = this.parent as AnnotationsDomainObject;
    if (annotationDomainObject === undefined) {
      return false;
    }
    const annotation = annotationDomainObject.selectedAnnotation;
    if (annotation === undefined) {
      return false;
    }
    const box = annotation.selectedPrimitive;
    if (!(box instanceof Box)) {
      return false;
    }
    box.copy(this.box);

    const change = inDragging ? Changes.dragging : Changes.changedPart;
    const changeDesc = new AnnotationChangedDescription(change, annotation);
    annotationDomainObject.notify(changeDesc);
    return true;
  }
}
