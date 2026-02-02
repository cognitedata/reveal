/*!
 * Copyright 2023 Cognite AS
 */

import glsl from 'glslify';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DepthModes,
  GLSL3,
  GreaterDepth,
  Group,
  LessEqualDepth,
  Matrix4,
  Object3D,
  Points,
  RawShaderMaterial,
  ShaderMaterial,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import overlay3DIconVert from './overlay3DIcon.vert';
import overlay3DIconFrag from './overlay3DIcon.frag';

export type OverlayPointsParameters = {
  iconAtlasTexture: Texture;
  numberTexture?: Texture;
  maskTexture?: Texture;
  minPixelSize: number;
  maxPixelSize: number;
  radius: number;
  colorTint?: Color;
  depthMode?: DepthModes;
  collectionOpacity?: number;
};

export const DEFAULT_OVERLAY_FRONT_OPACITY = 1;
export const DEFAULT_OVERLAY_BACK_OPACITY = 0.5;

export class OverlayPointsObject extends Group {
  private readonly _geometry: BufferGeometry;
  private readonly _positionBuffer: Float32Array;
  private readonly _positionAttribute: BufferAttribute;
  private readonly _colorBuffer: Float32Array;
  private readonly _colorAttribute: BufferAttribute;
  private readonly _sizeScaleBuffer: Float32Array;
  private readonly _sizeScaleAttribute: BufferAttribute;
  private readonly _isClusterBuffer: Float32Array;
  private readonly _isClusterAttribute: BufferAttribute;
  private readonly _clusterSizeBuffer: Float32Array;
  private readonly _clusterSizeAttribute: BufferAttribute;
  private readonly _isHoveredBuffer: Float32Array;
  private readonly _isHoveredAttribute: BufferAttribute;
  private readonly _points: {
    frontPoints: Points<BufferGeometry, RawShaderMaterial>;
    backPoints: Points<BufferGeometry, RawShaderMaterial>;
  };
  private readonly _onBeforeRender?: Object3D['onBeforeRender'];
  private _modelTransform: Matrix4;

  constructor(
    maxNumberOfPoints: number,
    materialParameters: OverlayPointsParameters,
    onBeforeRender?: Object3D['onBeforeRender']
  ) {
    super();
    const geometry = new BufferGeometry();
    this._positionBuffer = new Float32Array(maxNumberOfPoints * 3);
    this._positionAttribute = new BufferAttribute(this._positionBuffer, 3);
    this._colorBuffer = new Float32Array(maxNumberOfPoints * 3).fill(1);
    this._colorAttribute = new BufferAttribute(this._colorBuffer, 3);
    this._sizeScaleBuffer = new Float32Array(maxNumberOfPoints).fill(1);
    this._sizeScaleAttribute = new BufferAttribute(this._sizeScaleBuffer, 1);
    this._isClusterBuffer = new Float32Array(maxNumberOfPoints).fill(0);
    this._isClusterAttribute = new BufferAttribute(this._isClusterBuffer, 1);
    this._clusterSizeBuffer = new Float32Array(maxNumberOfPoints).fill(0);
    this._clusterSizeAttribute = new BufferAttribute(this._clusterSizeBuffer, 1);
    this._isHoveredBuffer = new Float32Array(maxNumberOfPoints).fill(0);
    this._isHoveredAttribute = new BufferAttribute(this._isHoveredBuffer, 1);
    this._modelTransform = new Matrix4();
    geometry.setAttribute('position', this._positionAttribute);
    geometry.setAttribute('color', this._colorAttribute);
    geometry.setAttribute('sizeScale', this._sizeScaleAttribute);
    geometry.setAttribute('isCluster', this._isClusterAttribute);
    geometry.setAttribute('clusterSize', this._clusterSizeAttribute);
    geometry.setAttribute('isHovered', this._isHoveredAttribute);
    geometry.setDrawRange(0, 0);

    const {
      iconAtlasTexture,
      numberTexture,
      minPixelSize,
      maxPixelSize,
      radius,
      colorTint = new Color(1, 1, 1),
      depthMode = LessEqualDepth,
      collectionOpacity = DEFAULT_OVERLAY_FRONT_OPACITY,
      maskTexture
    } = materialParameters;

    const frontMaterial = this.createIconsMaterial(
      iconAtlasTexture,
      numberTexture,
      maskTexture,
      collectionOpacity,
      depthMode,
      minPixelSize,
      maxPixelSize,
      radius,
      colorTint,
      false
    );

    const backMaterial = this.createIconsMaterial(
      iconAtlasTexture,
      numberTexture,
      maskTexture,
      DEFAULT_OVERLAY_BACK_OPACITY,
      GreaterDepth,
      minPixelSize,
      maxPixelSize,
      radius,
      colorTint,
      false
    );

    const frontPoints = this.initializePoints(geometry, frontMaterial);
    const backPoints = this.initializePoints(geometry, backMaterial);

    this.add(backPoints);
    this.add(frontPoints);

    this._geometry = geometry;
    this._points = { frontPoints, backPoints };
    this._onBeforeRender = onBeforeRender;
  }

  public getOpacity(): number {
    return this._points.frontPoints.material.uniforms.collectionOpacity.value;
  }

  public setOpacity(value: number): void {
    this._points.frontPoints.material.uniforms.collectionOpacity.value = value;
    this._points.backPoints.material.uniforms.collectionOpacity.value = value / 2;
  }

  public isBackPointsVisible(): boolean {
    return this._points.backPoints.visible;
  }

  public setBackPointsVisible(value: boolean): void {
    this._points.backPoints.visible = value;
  }

  public setPoints(
    points: Vector3[],
    colors?: Color[],
    sizeScales?: number[],
    isClusterFlags?: boolean[],
    clusterSizes?: number[],
    isHoveredFlags?: boolean[]
  ): void {
    if (colors && points.length !== colors?.length)
      throw new Error('Points positions and colors arrays must have the same length');

    if (sizeScales && points.length !== sizeScales.length)
      throw new Error('Points positions and sizeScales arrays must have the same length');

    if (isClusterFlags && points.length !== isClusterFlags.length)
      throw new Error('Points positions and isClusterFlags arrays must have the same length');

    if (clusterSizes && points.length !== clusterSizes.length)
      throw new Error('Points positions and clusterSizes arrays must have the same length');

    if (isHoveredFlags && points.length !== isHoveredFlags.length)
      throw new Error('Points positions and isHoveredFlags arrays must have the same length');

    if (points.length * 3 > this._positionBuffer.length) {
      throw new Error('Points array length exceeds the maximum number of points');
    }

    for (let index = 0; index < points.length; index++) {
      this._positionBuffer[index * 3 + 0] = points[index].x;
      this._positionBuffer[index * 3 + 1] = points[index].y;
      this._positionBuffer[index * 3 + 2] = points[index].z;

      if (colors) {
        this._colorBuffer[index * 3 + 0] = colors[index].r;
        this._colorBuffer[index * 3 + 1] = colors[index].g;
        this._colorBuffer[index * 3 + 2] = colors[index].b;
      }

      if (sizeScales) {
        this._sizeScaleBuffer[index] = sizeScales[index];
      } else {
        this._sizeScaleBuffer[index] = 1;
      }

      if (isClusterFlags) {
        this._isClusterBuffer[index] = isClusterFlags[index] ? 1 : 0;
      } else {
        this._isClusterBuffer[index] = 0;
      }

      if (clusterSizes) {
        this._clusterSizeBuffer[index] = clusterSizes[index];
      } else {
        this._clusterSizeBuffer[index] = 0;
      }

      if (isHoveredFlags) {
        this._isHoveredBuffer[index] = isHoveredFlags[index] ? 1 : 0;
      } else {
        this._isHoveredBuffer[index] = 0;
      }
    }

    this._positionAttribute.clearUpdateRanges();
    this._positionAttribute.updateRanges.push({ start: 0, count: points.length * 3 });
    this._positionAttribute.needsUpdate = true;

    this._colorAttribute.clearUpdateRanges();
    this._colorAttribute.updateRanges.push({ start: 0, count: points.length * 3 });
    this._colorAttribute.needsUpdate = true;

    this._sizeScaleAttribute.clearUpdateRanges();
    this._sizeScaleAttribute.updateRanges.push({ start: 0, count: points.length });
    this._sizeScaleAttribute.needsUpdate = true;

    this._isClusterAttribute.clearUpdateRanges();
    this._isClusterAttribute.updateRanges.push({ start: 0, count: points.length });
    this._isClusterAttribute.needsUpdate = true;

    this._clusterSizeAttribute.clearUpdateRanges();
    this._clusterSizeAttribute.updateRanges.push({ start: 0, count: points.length });
    this._clusterSizeAttribute.needsUpdate = true;

    this._isHoveredAttribute.clearUpdateRanges();
    this._isHoveredAttribute.updateRanges.push({ start: 0, count: points.length });
    this._isHoveredAttribute.needsUpdate = true;

    this._geometry.setDrawRange(0, points.length);

    this._geometry.computeBoundingBox();
    this._geometry.computeBoundingSphere();
  }

  public setTransform(transform: Matrix4): void {
    this._points.frontPoints.position.setFromMatrixPosition(transform);
    this._points.frontPoints.quaternion.setFromRotationMatrix(transform);
    this._points.frontPoints.scale.setFromMatrixScale(transform);

    this._points.backPoints.position.setFromMatrixPosition(transform);
    this._points.backPoints.quaternion.setFromRotationMatrix(transform);
    this._points.backPoints.scale.setFromMatrixScale(transform);

    this._modelTransform = transform.clone();
  }

  public getTransform(out?: Matrix4): Matrix4 {
    if (out !== undefined) {
      out.copy(this._modelTransform);
      return out;
    }
    return this._modelTransform.clone();
  }

  public dispose(): void {
    this._geometry.dispose();
    this._points.frontPoints.material.dispose();
    this._points.backPoints.material.dispose();
    this.clear();
  }

  private initializePoints(
    geometry: BufferGeometry,
    material: RawShaderMaterial
  ): Points<BufferGeometry, RawShaderMaterial> {
    const points = createPoints(geometry, material);
    points.onBeforeRender = (renderer, ...rest) => {
      this._onBeforeRender?.(renderer, ...rest);
      setUniforms(renderer, material);
    };

    return points;

    function createPoints(
      geometry: BufferGeometry,
      material: RawShaderMaterial
    ): Points<BufferGeometry, RawShaderMaterial> {
      const points = new Points(geometry, material);
      points.frustumCulled = false;
      points.renderOrder = 4;
      return points;
    }

    function setUniforms(renderer: WebGLRenderer, material: ShaderMaterial): void {
      renderer.getDrawingBufferSize(material.uniforms.renderSize.value);
      material.uniforms.renderDownScale.value = material.uniforms.renderSize.value.x / renderer.domElement.clientWidth;
    }
  }

  private createIconsMaterial(
    iconAtlasTexture: Texture,
    numberTexture: Texture | undefined,
    maskTexture: Texture | undefined,
    collectionOpacity: number,
    depthFunction: DepthModes,
    minPixelSize: number,
    maxPixelSize: number,
    radius: number,
    colorTint: Color,
    depthWrite: boolean
  ): RawShaderMaterial {
    return new RawShaderMaterial({
      uniforms: {
        iconAtlasTexture: { value: iconAtlasTexture },
        numberTexture: { value: numberTexture },
        maskTexture: { value: maskTexture },
        radius: { value: radius },
        colorTint: { value: colorTint },
        renderSize: { value: new Vector2(1, 1) },
        collectionOpacity: { value: collectionOpacity },
        renderDownScale: { value: 1 },
        pixelSizeRange: { value: new Vector2(minPixelSize, maxPixelSize) }
      },
      defines: {
        ...(maskTexture !== undefined && { isMaskDefined: true }),
        ...(numberTexture !== undefined && { hasNumberTexture: true })
      },
      vertexShader: glsl(overlay3DIconVert),
      fragmentShader: glsl(overlay3DIconFrag),
      depthTest: true,
      depthWrite: depthWrite,
      depthFunc: depthFunction,
      glslVersion: GLSL3,
      transparent: true
    });
  }
}
