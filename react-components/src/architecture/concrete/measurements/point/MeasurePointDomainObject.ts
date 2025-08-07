import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { Color, type Vector3 } from 'three';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { BoxDomainObject } from '../../primitives/box/BoxDomainObject';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { SolidPrimitiveRenderStyle } from '../../primitives/common/SolidPrimitiveRenderStyle';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';

const DEFAULT_POINT_SIZE = 0.05;
export class MeasurePointDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(PrimitiveType.Point);
    this.color = new Color(Color.NAMES.deepskyblue);
    this.size = DEFAULT_POINT_SIZE;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override clone(what?: symbol): DomainObject {
    const clone = new MeasurePointDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }

  public override canMoveCorners(): boolean {
    return false;
  }

  public override canRotateComponent(_component: number): boolean {
    return false;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    const { point, size } = this;

    add({ key: 'X:COORDINATE' }, point.x, Quantity.Length);
    add({ key: 'Y_COORDINATE' }, point.y, Quantity.Length);
    add({ key: 'Z_COORDINATE' }, point.z, Quantity.Length);
    add({ key: 'POINT_SIZE' }, size, Quantity.Length);
    return info;

    function add(translationInput: TranslationInput, value: number, quantity: Quantity): void {
      info.add({ translationInput, value, quantity });
    }
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new SolidPrimitiveRenderStyle();
    style.showLabel = false;
    style.showLines = true;
    style.solidOpacityUse = true;
    style.selectedSolidOpacity = 1;
    style.solidOpacity = 0.5;
    return style;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public get size(): number {
    return this.box.size.x;
  }

  public set size(value: number) {
    this.box.size.setScalar(value);
  }

  public get point(): Vector3 {
    return this.box.center;
  }

  public set point(value: Vector3) {
    this.box.center.copy(value);
  }
}
