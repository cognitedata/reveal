import { Color } from 'three';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type AnnotationsDomainObject } from './AnnotationsDomainObject';
import { CylinderDomainObject } from '../primitives/cylinder/CylinderDomainObject';
import { SolidDomainObject } from '../primitives/common/SolidDomainObject';
import { SolidPrimitiveRenderStyle } from '../primitives/common/SolidPrimitiveRenderStyle';
import { AnnotationChangedDescription } from './helpers/AnnotationChangedDescription';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { CopyToClipboardCommand } from '../../base/concreteCommands/CopyToClipboardCommand';
import { ToggleMetricUnitsCommand } from '../../base/concreteCommands/ToggleMetricUnitsCommand';
import { Cylinder } from '../../base/utilities/primitives/Cylinder';
import { Annotation } from './helpers/Annotation';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';

export class CylinderGizmoDomainObject extends CylinderDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType = PrimitiveType.Cylinder) {
    super(primitiveType);
    this.color = new Color(Color.NAMES.white);
  }
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslationInput {
    return { key: 'CYLINDER' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new SolidPrimitiveRenderStyle();
    style.showLabel = false;
    style.solidOpacity = 0.3333;
    return style;
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new CylinderGizmoDomainObject();
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
    return [new CopyToClipboardCommand(), new ToggleMetricUnitsCommand()];
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
  // INSTANCE METHODS
  // ==================================================

  public createAnnotation(): Annotation {
    const cylinder = new Cylinder();
    cylinder.copy(this.cylinder);
    return Annotation.create(cylinder);
  }

  public updateThisFromAnnotation(annotation: Annotation): boolean {
    const cylinder = annotation.selectedPrimitive;
    if (!(cylinder instanceof Cylinder)) {
      return false;
    }
    this.cylinder.copy(cylinder);
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
    const cylinder = annotation.selectedPrimitive;
    if (!(cylinder instanceof Cylinder)) {
      return false;
    }
    cylinder.copy(this.cylinder);

    const change = inDragging ? Changes.dragging : Changes.changedPart;
    const changeDesc = new AnnotationChangedDescription(change, annotation);
    annotationDomainObject.notify(changeDesc);
    return true;
  }
}
