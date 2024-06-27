/*!
 * Copyright 2024 Cognite AS
 */

import {
  BufferGeometry,
  type DataTexture,
  DoubleSide,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshPhongMaterial,
  type Color,
  type Object3D,
  Box3
} from 'three';
import { ContouringService } from './geometry/ContouringService';
import { type TerrainDomainObject } from './TerrainDomainObject';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { RegularGrid2Buffers } from './geometry/RegularGrid2Buffers';
import {
  create1DTextureWithContours,
  create1DTexture
} from '../../base/utilities/colors/create1DTexture';
import { type TerrainRenderStyle } from './TerrainRenderStyle';
import { ColorType } from '../../base/domainObjectsHelpers/ColorType';
import { WHITE_COLOR } from '../../base/utilities/colors/colorExtensions';
import { getColorMap } from '../../base/utilities/colors/colorMaps';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type RegularGrid2 } from './geometry/RegularGrid2';

const SOLID_NAME = 'Solid';
const CONTOURS_NAME = 'Contour';

export class TerrainThreeView extends GroupThreeView<TerrainDomainObject> {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected override get style(): TerrainRenderStyle {
    return super.style as TerrainRenderStyle;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (this.isEmpty) {
      return;
    }
    if (change.isChanged(Changes.colorMap)) {
      this.clearMemory();
      this.invalidateRenderTarget();
    }
    if (change.isChanged(Changes.renderStyle)) {
      // TODO: Need better change handling
      const style = this.style;
      {
        const solid = this.object.getObjectByName(SOLID_NAME) as Mesh;
        if (solid !== undefined && !style.showSolid) {
          this.removeChild(solid);
          this.invalidateRenderTarget();
        } else if (solid === undefined && style.showSolid) {
          this.addChild(this.createSolid());
          this.invalidateRenderTarget();
        } else if (solid !== undefined) {
          updateSolidMaterial(solid.material as MeshPhongMaterial, this.domainObject, style);
          this.invalidateRenderTarget();
        }
      }
      {
        const contours = this.object.getObjectByName(CONTOURS_NAME) as LineSegments;
        if (contours !== undefined && !style.showContours) {
          this.removeChild(contours);
          this.invalidateRenderTarget();
        } else if (contours === undefined && style.showContours) {
          this.addChild(this.createContours());
          this.invalidateRenderTarget();
        } else if (contours !== undefined) {
          updateContoursMaterial(contours.material as LineBasicMaterial, this.domainObject, style);
          this.invalidateRenderTarget();
        }
      }
    }
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  protected override calculateBoundingBox(): Box3 {
    const { grid } = this.domainObject;
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
  // OVERRIDES of GroupThreeView
  // ==================================================

  protected override addChildren(): void {
    const { grid } = this.domainObject;
    if (grid === undefined) {
      return undefined;
    }
    this.addChild(this.createSolid());
    this.addChild(this.createContours());
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private createSolid(): Object3D | undefined {
    const { style } = this;
    if (!style.showSolid) {
      return undefined;
    }
    const { domainObject } = this;
    const { grid } = domainObject;
    if (grid === undefined) {
      return undefined;
    }
    const buffers = new RegularGrid2Buffers(grid, true);
    const geometry = buffers.createBufferGeometry();

    const material = new MeshPhongMaterial();
    updateSolidMaterial(material, domainObject, style);

    const result = new Mesh(geometry, material);
    result.name = SOLID_NAME;
    applyMatrix(result, grid);
    return result;
  }

  private createContours(): Object3D | undefined {
    const { style } = this;
    if (!style.showContours) {
      return undefined;
    }
    const { domainObject } = this;
    const { grid } = domainObject;
    if (grid === undefined) {
      return undefined;
    }
    const service = new ContouringService(style.increment);
    const contoursBuffer = service.createContoursAsXyzArray(grid);
    if (contoursBuffer.length === 0) {
      return undefined;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(contoursBuffer, 3));

    const material = new LineBasicMaterial();
    updateContoursMaterial(material, domainObject, style);

    const result = new LineSegments(geometry, material);
    result.name = CONTOURS_NAME;
    applyMatrix(result, grid);
    return result;
  }
}
// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function applyMatrix(object: Object3D, grid: RegularGrid2): void {
  object.rotateZ(grid.rotationAngle);
  object.position.set(grid.origin.x, grid.origin.y, 0);
  object.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
}

function updateSolidMaterial(
  material: MeshPhongMaterial,
  terrainDomainObject: TerrainDomainObject,
  style: TerrainRenderStyle,
  is2D: boolean = false
): void {
  material.side = DoubleSide; // the terrain must be seen from both side
  material.polygonOffset = style.showContours; // Because of the contours to be visible
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
    if (material.map !== null) {
      material.map.dispose();
      material.map = null;
    }
    material.color = terrainDomainObject.getColorByColorType(style.solidColorType);
  }
}

function updateContoursMaterial(
  material: LineBasicMaterial,
  terrainDomainObject: TerrainDomainObject,
  style: TerrainRenderStyle
): void {
  material.color = terrainDomainObject.getColorByColorType(style.contoursColorType);
  material.linewidth = 1;
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
