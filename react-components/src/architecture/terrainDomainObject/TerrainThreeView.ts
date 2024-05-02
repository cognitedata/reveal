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
  Object3D,
  Box3
} from 'three';
import { ContouringService } from '../utilities/geometry/ContouringService';
import { TerrainDomainObject } from './TerrainDomainObject';
import { DomainObjectChange } from '../utilities/misc/DomainObjectChange';
import { Changes } from '../utilities/misc/Changes';
import { RegularGrid2Buffers } from '../utilities/geometry/RegularGrid2Buffers';
import { create1DTextureWithContours, create1DTexture } from '../utilities/colors/create1DTexture';
import { TerrainRenderStyle } from './TerrainRenderStyle';
import { ColorType } from '../utilities/colors/ColorType';
import { WHITE_COLOR } from '../utilities/colors/colorExtensions';
import { getColorMap } from '../utilities/colors/colorMaps';
import { ObjectThreeView } from '../views/ObjectThreeView';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

const SOLID_NAME = 'Solid';
const CONTOURS_NAME = 'Contour';

export class TerrainThreeView extends ObjectThreeView {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get terrainDomainObject(): TerrainDomainObject {
    return super.domainObject as TerrainDomainObject;
  }

  protected get style(): TerrainRenderStyle {
    return super.style as TerrainRenderStyle;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (this._object === undefined) {
      return;
    }
    if (change.isChanged(Changes.colorMap)) {
      this.clearMemory();
    }
    if (change.isChanged(Changes.renderStyle)) {
      const solid = this._object.getObjectByName(SOLID_NAME) as Mesh;
      if (solid !== undefined) {
        updateMaterial(solid.material as MeshPhongMaterial, this.terrainDomainObject, this.style);
        this.invalidate();
        return;
      }
      this.clearMemory();
    }
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  public override calculateBoundingBox(): Box3 {
    const { terrainDomainObject } = this;
    const { grid } = terrainDomainObject;
    if (grid === undefined) {
      return new Box3().makeEmpty();
    }
    const range = grid.boundingBox;
    if (range.isEmpty) {
      return new Box3().makeEmpty();
    }
    const boundingBox = new Box3();
    boundingBox.min.set(range.x.min, range.y.min, range.z.min);
    boundingBox.max.set(range.x.max, range.y.max, range.z.max);

    // Convert to viewer space
    boundingBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    return boundingBox;
  }

  // ==================================================
  // OVERRIDES of ObjectThreeView
  // ==================================================

  protected override createObject3D(): Object3D | undefined {
    const { terrainDomainObject } = this;
    const { grid } = terrainDomainObject;
    if (grid === undefined) {
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
    group.rotateZ(grid.rotationAngle);
    group.position.x = grid.origin.x;
    group.position.y = grid.origin.y;
    group.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
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
    const { terrainDomainObject } = this;
    const { grid } = terrainDomainObject;
    if (grid === undefined) {
      return undefined;
    }
    const buffers = new RegularGrid2Buffers(grid, true);
    const geometry = buffers.createBufferGeometry();

    const material = new MeshPhongMaterial();
    updateMaterial(material, terrainDomainObject, style);

    const mesh = new Mesh(geometry, material);
    mesh.name = SOLID_NAME;
    return mesh;
  }

  private createContours(): Object3D | undefined {
    const { style } = this;
    if (!style.showContours) {
      return undefined;
    }
    const { terrainDomainObject } = this;
    const { grid } = terrainDomainObject;
    if (grid === undefined) {
      return undefined;
    }
    const color = terrainDomainObject.getColorByColorType(style.contoursColorType);
    const service = new ContouringService(style.increment);

    const contoursBuffer = service.createContoursAsXyzArray(grid);
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

function updateMaterial(
  material: MeshPhongMaterial,
  terrainDomainObject: TerrainDomainObject,
  style: TerrainRenderStyle,
  is2D: boolean = false
): void {
  material.side = DoubleSide; // the terrain must be seen from both side
  material.polygonOffset = style.showContours; // Because of the countours to be visible
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;

  material.opacity = style.solidOpacityUse ? style.solidOpacity : 1;
  material.transparent = style.solidOpacityUse;
  if (is2D) {
    material.shininess = 0;
  } else {
    material.shininess = style.solidShininessUse ? 100 * style.solidShininess : 0;
  }
  material.specular = WHITE_COLOR;
  const texture = createTexture(terrainDomainObject, style);
  if (texture !== undefined) {
    texture.anisotropy = 2;
    material.color = WHITE_COLOR;
    material.map = texture;
  } else {
    material.color = terrainDomainObject.getColorByColorType(style.solidColorType);
  }
}

function createTexture(
  terrainDomainObject: TerrainDomainObject,
  style: TerrainRenderStyle
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
    color = terrainDomainObject.getColorByColorType(style.solidColorType);
  }
  const { grid } = terrainDomainObject;
  if (grid === undefined) {
    return undefined;
  }
  return create1DTextureWithContours(
    colorMap,
    grid.boundingBox.z,
    style.increment,
    style.solidContourVolume,
    color
  );
}
