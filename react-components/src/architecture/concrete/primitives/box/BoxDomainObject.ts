import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import {
  PrimitiveType,
  verifyPrimitiveType
} from '../../../base/utilities/primitives/PrimitiveType';
import { type PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { BoxDragger } from './BoxDragger';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { type TranslationInput } from '../../../base/utilities/translation/TranslateInput';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import {
  PanelInfo,
  type SetValue,
  type VerifyValue
} from '../../../base/domainObjectsHelpers/PanelInfo';
import { SolidDomainObject } from '../common/SolidDomainObject';
import { SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { Box } from '../../../base/utilities/primitives/Box';
import { type Box3, type Vector3 } from 'three';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';

export abstract class BoxDomainObject extends SolidDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly box = new Box();
  private readonly _primitiveType: PrimitiveType;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor(primitiveType: PrimitiveType = PrimitiveType.Box) {
    super();
    verifyPrimitiveType(LEGAL_PRIMITIVE_TYPES, primitiveType);
    this._primitiveType = primitiveType;
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslationInput {
    switch (this.primitiveType) {
      case PrimitiveType.HorizontalArea:
        return { key: 'HORIZONTAL_AREA' };
      case PrimitiveType.VerticalArea:
        return { key: 'VERTICAL_AREA' };
      case PrimitiveType.Box:
        return { key: 'VOLUME' };
      case PrimitiveType.Point:
        return { key: 'POINT' };
      default:
        throw new Error('Unknown PrimitiveType');
    }
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new SolidPrimitiveRenderStyle();
  }

  public override createDragger(props: CreateDraggerProps): BaseDragger | undefined {
    const pickInfo = props.intersection.userData as PrimitivePickInfo;
    if (pickInfo === undefined) {
      return undefined; // If the pickInfo isn't specified, no dragger is created
    }
    return new BoxDragger(props, this);
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    const isFinished = this.focusType !== FocusType.Pending;
    const { primitiveType } = this;
    const { box } = this;
    const { size } = box;

    const hasX = Box.isValidSize(size.x);
    const hasY = Box.isValidSize(size.y);
    const hasZ = Box.isValidSize(size.z);

    if (isFinished || hasX) {
      const setSizeX = (value: number): void => {
        this.setSizeComponent(0, value);
      };
      add({ key: 'LENGTH' }, size.x, Quantity.Length, setSizeX, verifySize);
    }
    if (primitiveType !== PrimitiveType.VerticalArea && (isFinished || hasY)) {
      const setSizeY = (value: number): void => {
        this.setSizeComponent(1, value);
      };
      add({ key: 'DEPTH' }, size.y, Quantity.Length, setSizeY, verifySize);
    }
    if (primitiveType !== PrimitiveType.HorizontalArea && (isFinished || hasZ)) {
      const setSizeZ = (value: number): void => {
        this.setSizeComponent(2, value);
      };
      add({ key: 'HEIGHT' }, size.z, Quantity.Length, setSizeZ, verifySize);
    }
    if (this.canRotateComponent(2) && isFinished) {
      const setZRotation = (value: number): void => {
        this.setZRotationInDegrees(value);
      };
      add({ key: 'HORIZONTAL_ANGLE' }, box.zRotationInDegrees, Quantity.Angle, setZRotation);
    }
    if (primitiveType !== PrimitiveType.Box && (isFinished || box.hasArea)) {
      add({ key: 'AREA' }, this.area, Quantity.Area);
    }
    if (primitiveType === PrimitiveType.Box && (isFinished || box.hasHorizontalArea)) {
      add({ key: 'HORIZONTAL_AREA' }, box.horizontalArea, Quantity.Area);
    }
    if (primitiveType === PrimitiveType.Box && (isFinished || box.hasVolume)) {
      add({ key: 'VOLUME' }, box.volume, Quantity.Volume);
    }
    return info;

    function add(
      translationInput: TranslationInput,
      value: number,
      quantity: Quantity,
      setValue?: SetValue,
      verifyValue?: VerifyValue
    ): void {
      info.add({
        translationInput,
        value,
        quantity,
        setValue: isFinished ? setValue : undefined,
        verifyValue: isFinished ? verifyValue : undefined
      });
    }
  }

  public override copyFrom(domainObject: BoxDomainObject, what?: symbol): void {
    super.copyFrom(domainObject, what);
    if (what === undefined || what === Changes.geometry) {
      this.box.copy(domainObject.box);
    }
  }

  public override getEditToolCursor(
    renderTarget: RevealRenderTarget,
    point?: Vector3
  ): string | undefined {
    if (this.focusType === FocusType.Body) {
      return 'move';
    } else if (this.focusType === FocusType.Face) {
      if (this.focusFace === undefined) {
        return undefined;
      }
      const faceCenter = this.focusFace.getCenter();
      const matrix = this.box.getMatrix();
      faceCenter.applyMatrix4(matrix);
      return renderTarget.getResizeCursor(this.box.center, faceCenter);
    } else if (this.focusType === FocusType.Corner) {
      if (this.focusFace === undefined || point === undefined) {
        return undefined;
      }
      const faceCenter = this.focusFace.getCenter();
      const matrix = this.box.getMatrix();
      faceCenter.applyMatrix4(matrix);

      return renderTarget.getResizeCursor(point, faceCenter);
    } else if (this.focusType === FocusType.Rotation) {
      return 'grab';
    } else {
      return undefined;
    }
  }

  // ==================================================
  // OVERRIDES of SolidDomainObject
  // ==================================================

  public override get primitiveType(): PrimitiveType {
    return this._primitiveType;
  }

  public override clear(): void {
    super.clear();
    this.box.clear();
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public canMoveCorners(): boolean {
    return true;
  }

  public canRotateComponent(_component: number): boolean {
    return true;
  }

  // ==================================================
  // INSTANCE METHODS / PROPERTIES:
  // ==================================================

  public get area(): number {
    const { box } = this;
    switch (this.primitiveType) {
      case PrimitiveType.Point:
        return 0;
      case PrimitiveType.VerticalArea:
        return box.verticalArea;
      case PrimitiveType.HorizontalArea:
        return box.horizontalArea;
      case PrimitiveType.Box:
        return box.area;
      default:
        throw new Error(`Area calculation not implemented for : ${this.primitiveType}`);
    }
  }

  public override expandBoundingBox(boundingBox: Box3): void {
    this.box.expandBoundingBox(boundingBox);
  }

  private setSizeComponent(component: number, value: number): void {
    if (value > 0 && value !== this.box.size.getComponent(component)) {
      this.box.size.setComponent(component, value);
      this.notify(Changes.geometry);
    }
  }

  private setZRotationInDegrees(value: number): void {
    if (value !== this.box.zRotationInDegrees) {
      this.box.zRotationInDegrees = value;
      this.notify(Changes.geometry);
    }
  }
}

const LEGAL_PRIMITIVE_TYPES = [
  PrimitiveType.Point,
  PrimitiveType.VerticalArea,
  PrimitiveType.HorizontalArea,
  PrimitiveType.Box
];

function verifySize(value: number): boolean {
  return Box.isValidSize(value);
}
