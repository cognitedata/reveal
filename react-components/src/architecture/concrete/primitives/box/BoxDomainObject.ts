/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { BoxDragger } from './BoxDragger';
import { type CreateDraggerProps } from '../../../base/domainObjects/VisualDomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { PanelInfo } from '../../../base/domainObjectsHelpers/PanelInfo';
import { SolidDomainObject } from '../common/SolidDomainObject';
import { SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { Box } from '../../../base/utilities/primitives/Box';
import { type Vector3 } from 'three';
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
    const { primitiveType } = this;
    const isFinished = this.focusType !== FocusType.Pending;
    const { box } = this;
    const { size } = box;

    const hasX = Box.isValidSize(size.x);
    const hasY = Box.isValidSize(size.y);
    const hasZ = Box.isValidSize(size.z);

    if (isFinished || hasX) {
      add({ key: 'LENGTH' }, size.x, Quantity.Length);
    }
    if (primitiveType !== PrimitiveType.VerticalArea && (isFinished || hasY)) {
      add({ key: 'DEPTH' }, size.y, Quantity.Length);
    }
    if (primitiveType !== PrimitiveType.HorizontalArea && (isFinished || hasZ)) {
      add({ key: 'HEIGHT' }, size.z, Quantity.Length);
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
    // I forgot to add text for rotation angle before the deadline, so I used a icon instead.
    if (box.rotation.z !== 0 && isFinished) {
      add({ key: 'HORIZONTAL_ANGLE' }, box.zRotationInDegrees, Quantity.Angle);
    }
    return info;

    function add(translationInput: TranslationInput, value: number, quantity: Quantity): void {
      info.add({ translationInput, value, quantity });
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

  public canRotateComponent(component: number): boolean {
    return component === 2;
  }

  // ==================================================
  // INSTANCE METHODS / PROPERTIES: Geometrical getters
  // ==================================================

  public get area(): number {
    const { size } = this.box;
    switch (this.primitiveType) {
      case PrimitiveType.HorizontalArea:
        return size.x * size.y;
      case PrimitiveType.VerticalArea:
        return size.x * size.z;
      case PrimitiveType.Box: {
        return this.box.area;
      }
      default:
        throw new Error('Unknown MeasureType type');
    }
  }
}
