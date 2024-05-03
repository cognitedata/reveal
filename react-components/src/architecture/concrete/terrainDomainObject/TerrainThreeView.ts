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
import { ContouringService } from '../../base/utilities/geometry/ContouringService';
import { TerrainDomainObject } from './TerrainDomainObject';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { RegularGrid2Buffers } from '../../base/utilities/geometry/RegularGrid2Buffers';
import {
  create1DTextureWithContours,
  create1DTexture
} from '../../base/utilities/colors/create1DTexture';
import { TerrainRenderStyle } from './TerrainRenderStyle';
import { ColorType } from '../../base/domainObjectsHelpers/ColorType';
import { WHITE_COLOR } from '../../base/utilities/colors/colorExtensions';
import { getColorMap } from '../../base/utilities/colors/colorMaps';
import { ObjectThreeView } from '../../base/views/ObjectThreeView';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { RegularGrid2 } from '../../base/utilities/geometry/RegularGrid2';

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
      // TODO: Need better change handling
      const style = this.style;
      {
        const solid = this._object.getObjectByName(SOLID_NAME) as Mesh;
        if (solid !== undefined && !style.showSolid) {
          this._object.remove(solid);
          this.invalidate();
        } else if (solid === undefined && style.showSolid) {
          add(this._object, this.createSolid());
          this.invalidate();
        } else if (solid !== undefined) {
          updateSolidMaterial(solid.material as MeshPhongMaterial, this.terrainDomainObject, style);
          this.invalidate();
        }
      }
      {
        const contours = this._object.getObjectByName(CONTOURS_NAME) as LineSegments;
        if (contours !== undefined && !style.showContours) {
          this._object.remove(contours);
          this.invalidate();
        } else if (contours === undefined && style.showContours) {
          add(this._object, this.createContours());
          this.invalidate();
        } else if (contours !== undefined) {
          updateContoursMaterial(
            contours.material as LineBasicMaterial,
            this.terrainDomainObject,
            style
          );
          this.invalidate();
        }
      }
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
    add(group, this.createSolid());
    add(group, this.createContours());
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
    updateSolidMaterial(material, terrainDomainObject, style);

    const mesh = new Mesh(geometry, material);
    mesh.name = SOLID_NAME;
    applyMatrix(mesh, grid);
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
    const service = new ContouringService(style.increment);

    const contoursBuffer = service.createContoursAsXyzArray(grid);
    if (contoursBuffer.length === 0) {
      return undefined;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(contoursBuffer, 3));

    const material = new LineBasicMaterial();
    updateContoursMaterial(material, terrainDomainObject, style);

    const contours = new LineSegments(geometry, material);
    contours.name = CONTOURS_NAME;
    applyMatrix(contours, grid);
    return contours;
  }
}
// ==================================================
// LOCAL FUNCTIONS
// ==================================================

function add(parent: Object3D, child: Object3D | undefined): void {
  if (child !== undefined) {
    parent.add(child);
  }
}

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
