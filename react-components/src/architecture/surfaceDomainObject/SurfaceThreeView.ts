/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  BufferGeometry,
  DataTexture,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshPhongMaterial,
  Color,
  Object3D
} from 'three';
import { ContouringService } from '../utilities/geometry/ContouringService';
import { SurfaceDomainObject } from './SurfaceDomainObject';
import { DomainObjectChange } from '../utilities/misc/DomainObjectChange';
import { Changes } from '../utilities/misc/Changes';
import { RegularGrid2Buffers } from '../utilities/geometry/RegularGrid2Buffers';
import { Range3 } from '../utilities/geometry/Range3';
import { create1DTextureWithContours, create1DTexture } from '../utilities/colors/create1DTexture';
import { SurfaceRenderStyle } from './SurfaceRenderStyle';
import { ColorType } from '../utilities/colors/ColorType';
import { WHITE_COLOR } from '../utilities/colors/colorExtensions';
import { getColorMap } from '../utilities/colors/colorMaps';
import { ObjectThreeView } from '../views/ObjectThreeView';

const SOLID_NAME = 'Solid';
const CONTOURS_NAME = 'Contour';

export class SurfaceThreeView extends ObjectThreeView {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get surfaceDomainObject(): SurfaceDomainObject {
    return super.domainObject as SurfaceDomainObject;
  }

  protected get style(): SurfaceRenderStyle {
    return super.style as SurfaceRenderStyle;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (this._object3D === undefined) {
      return;
    }
    if (change.isChanged(Changes.colorMap)) {
      this.clearMemory();
    }
    if (change.isChanged(Changes.renderStyle)) {
      const solid = this._object3D.getObjectByName(SOLID_NAME) as Mesh;
      if (solid !== undefined) {
        setSolidMaterial(solid.material as MeshPhongMaterial, this.surfaceDomainObject, this.style);
        this.invalidate();
        return;
      }
      this.clearMemory();
    }
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  public override calculateBoundingBox(): Range3 {
    const { surfaceDomainObject } = this;
    const { surface } = surfaceDomainObject;
    if (surface === undefined) {
      return Range3.empty;
    }
    return surface.boundingBox;
  }

  // ==================================================
  // OVERRIDES of ObjectThreeView
  // ==================================================

  protected override createObject3D(): Object3D | undefined {
    const { surfaceDomainObject } = this;
    const { surface } = surfaceDomainObject;
    if (surface === undefined) {
      return undefined;
    }
    const group = new Group();
    {
      const solid = this.createSolid();
      if (solid !== undefined) {
        group.add(solid);
      }
    }
    {
      const contours = this.createContours();
      if (contours !== undefined) {
        group.add(contours);
      }
    }
    group.rotateZ(surface.rotationAngle);
    group.position.x = surface.origin.x;
    group.position.z = surface.origin.y;
    return group;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private createSolid(): Object3D | undefined {
    const { style } = this;
    if (!style.showSolid) {
      return undefined;
    }
    const { surfaceDomainObject } = this;
    const { surface } = surfaceDomainObject;
    if (surface === undefined) {
      return undefined;
    }
    const buffers = new RegularGrid2Buffers(surface, true);
    const geometry = buffers.createBufferGeometry();

    const material = new MeshPhongMaterial({
      side: DoubleSide,
      shadowSide: DoubleSide,
      polygonOffset: style.showContours, // Because of the countours to be visible
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 4.0
    });

    setSolidMaterial(material, surfaceDomainObject, style);

    const mesh = new Mesh(geometry, material);
    mesh.name = SOLID_NAME;
    return mesh;
  }

  private createContours(): Object3D | undefined {
    const { style } = this;
    if (!style.showContours) {
      return undefined;
    }
    const { surfaceDomainObject } = this;
    const { surface } = surfaceDomainObject;
    if (surface === undefined) {
      return undefined;
    }
    const color = surfaceDomainObject.getColorByColorType(style.contoursColorType);
    const service = new ContouringService(style.increment);

    const contoursBuffer = service.createContoursAsXyzArray(surface);
    if (contoursBuffer.length === 0) {
      return undefined;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(contoursBuffer, 3));

    const material = new LineBasicMaterial({
      color,
      linewidth: 1
    });
    const contours = new LineSegments(geometry, material);
    contours.name = CONTOURS_NAME;
    return contours;
  }
}

// ==================================================
// LOCAL FUNCTIONS
// ==================================================

function setSolidMaterial(
  material: MeshPhongMaterial,
  surfaceDomainObject: SurfaceDomainObject,
  style: SurfaceRenderStyle,
  is2D: boolean = false
): void {
  material.opacity = style.solidOpacityUse ? style.solidOpacity : 1;
  material.transparent = style.solidOpacityUse;
  if (is2D) {
    material.shininess = 0;
  } else {
    material.shininess = style.solidShininessUse ? 100 * style.solidShininess : 0;
  }
  const texture = createTexture(surfaceDomainObject, style);
  material.specular = WHITE_COLOR;
  if (texture !== undefined) {
    texture.anisotropy = 2;
    material.color = WHITE_COLOR;
    material.map = texture;
  } else {
    material.color = surfaceDomainObject.getColorByColorType(style.solidColorType);
  }
}

function createTexture(
  surfaceDomainObject: SurfaceDomainObject,
  style: SurfaceRenderStyle
): DataTexture | undefined {
  if (style.solidColorType !== ColorType.ColorMap && !style.solidContourUse) {
    return undefined;
  }
  const colorMap = getColorMap(style.solidColorMapType);
  if (colorMap === undefined) {
    return undefined;
  }
  let color: Color | undefined;
  if (style.solidColorType === ColorType.ColorMap) {
    if (!style.solidContourUse) {
      return create1DTexture(colorMap);
    }
  } else {
    color = surfaceDomainObject.getColorByColorType(style.solidColorType);
  }
  const { surface } = surfaceDomainObject;
  if (surface === undefined) {
    return undefined;
  }
  return create1DTextureWithContours(
    colorMap,
    surface.boundingBox.z,
    style.increment,
    style.solidContourVolume,
    color
  );
}
