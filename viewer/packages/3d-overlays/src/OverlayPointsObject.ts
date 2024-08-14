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
  spriteTexture: Texture;
  maskTexture?: Texture;
  minPixelSize: number;
  maxPixelSize: number;
  radius: number;
  colorTint?: Color;
  depthMode?: DepthModes;
  collectionOpacity?: number;
};

export class OverlayPointsObject extends Group {
  private readonly _geometry: BufferGeometry;
  private readonly _frontMaterial: RawShaderMaterial;
  private readonly _positionBuffer: Float32Array;
  private readonly _positionAttribute: BufferAttribute;
  private readonly _colorBuffer: Float32Array;
  private readonly _colorAttribute: BufferAttribute;
  private readonly _points: { frontPoints: Points; backPoints: Points };
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
    this._modelTransform = new Matrix4();
    geometry.setAttribute('position', this._positionAttribute);
    geometry.setAttribute('color', this._colorAttribute);
    geometry.setDrawRange(0, 0);

    const {
      spriteTexture,
      minPixelSize,
      maxPixelSize,
      radius,
      colorTint = new Color(1, 1, 1),
      depthMode = LessEqualDepth,
      collectionOpacity = 1,
      maskTexture
    } = materialParameters;

    const frontMaterial = this.createIconsMaterial(
      spriteTexture,
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
      spriteTexture,
      maskTexture,
      0.5,
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
    this._frontMaterial = frontMaterial;
    this._points = { frontPoints, backPoints };
    this._onBeforeRender = onBeforeRender;
  }

  public setPoints(points: Vector3[], colors?: Color[]): void {
    if (colors && points.length !== colors?.length)
      throw new Error('Points positions and colors arrays must have the same length');

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
    }

    this._positionAttribute.clearUpdateRanges();
    this._positionAttribute.updateRanges.push({ start: 0, count: points.length * 3 });
    this._positionAttribute.needsUpdate = true;

    this._colorAttribute.clearUpdateRanges();
    this._colorAttribute.updateRanges.push({ start: 0, count: points.length * 3 });
    this._colorAttribute.needsUpdate = true;
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
    this._frontMaterial.dispose();
    this._geometry.dispose();
  }

  private initializePoints(geometry: BufferGeometry, frontMaterial: ShaderMaterial): Points {
    const frontPoints = createPoints(geometry, frontMaterial);
    frontPoints.onBeforeRender = (renderer, ...rest) => {
      this._onBeforeRender?.(renderer, ...rest);
      setUniforms(renderer, frontMaterial);
    };

    return frontPoints;

    function createPoints(geometry: BufferGeometry, material: ShaderMaterial): Points {
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
    colorTexture: Texture,
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
        colorTexture: { value: colorTexture },
        maskTexture: { value: maskTexture },
        radius: { value: radius },
        colorTint: { value: colorTint },
        renderSize: { value: new Vector2(1, 1) },
        collectionOpacity: { value: collectionOpacity },
        renderDownScale: { value: 1 },
        pixelSizeRange: { value: new Vector2(minPixelSize, maxPixelSize) }
      },
      defines: {
        isMaskDefined: maskTexture !== undefined
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
