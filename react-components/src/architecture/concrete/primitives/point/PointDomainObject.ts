import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { PointDragger } from './PointDragger';
import {
  VisualDomainObject,
  type CreateDraggerProps
} from '../../../base/domainObjects/VisualDomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { Box3, Vector3 } from 'three';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { PointRenderStyle } from './PointRenderStyle';
import { type IconName } from '../../../../advanced-tree-view';
import { DomainObjectTransaction } from '../../../base/undo/DomainObjectTransaction';
import { type Transaction } from '../../../base/undo/Transaction';
import { getIconByPrimitiveType } from '../../../base/utilities/primitives/getIconByPrimitiveType';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { PopupStyle } from '../../../base/domainObjectsHelpers/PopupStyle';

export abstract class PointDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly point = new Vector3();
  public readonly radius = 0.1; // Default radius for the point representation

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): PointRenderStyle {
    return this.getRenderStyle() as PointRenderStyle;
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): IconName {
    return getIconByPrimitiveType(PrimitiveType.Point);
  }

  public override get typeName(): TranslationInput {
    return { key: 'POINT' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new PointRenderStyle();
  }

  public override createDragger(props: CreateDraggerProps): BaseDragger | undefined {
    return new PointDragger(props, this);
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    add({ key: 'X:COORDINATE' }, this.point.x, Quantity.Length);
    add({ key: 'Y_COORDINATE' }, this.point.y, Quantity.Length);
    add({ key: 'Z_COORDINATE' }, this.point.z, Quantity.Length);
    return info;

    function add(translationInput: TranslationInput, value: number, quantity: Quantity): void {
      info.add({ translationInput, value, quantity });
    }
  }

  public override getPanelInfoStyle(): PopupStyle {
    return new PopupStyle({ bottom: 50, left: 0 });
  }

  public override createTransaction(changed: symbol): Transaction {
    return new DomainObjectTransaction(this, changed);
  }

  public override getEditToolCursor(
    _renderTarget: RevealRenderTarget,
    _point?: Vector3
  ): string | undefined {
    return 'move';
  }

  public override copyFrom(domainObject: PointDomainObject, what?: symbol): void {
    super.copyFrom(domainObject, what);
    if (what === undefined || what === Changes.geometry) {
      this.point.copy(domainObject.point);
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public expandBoundingBox(boundingBox: Box3): void {
    const localBoundingBox = new Box3(this.point, this.point);
    localBoundingBox.expandByScalar(this.radius);
    boundingBox.union(localBoundingBox);
  }
}
