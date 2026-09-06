/*!
 * Copyright 2026 Cognite AS
 */

import type { DepthModes, ShaderMaterial, Vector3, WebGLRenderer } from 'three';
import {
  BufferAttribute,
  BufferGeometry,
  GLSL3,
  GreaterDepth,
  Group,
  LessEqualDepth,
  Matrix4,
  Points,
  RawShaderMaterial,
  Vector2
} from 'three';
import spriteClusterVert from './spriteCluster.vert';
import spriteClusterFrag from './spriteCluster.frag';
import { encodeClusterDigits } from './clusterDigitAtlas';
import type { ClusterSpriteTextures } from './clusterSpriteTextures';

const DEFAULT_OVERLAY_FRONT_OPACITY = 1;
const DEFAULT_OVERLAY_BACK_OPACITY = 0.5;

export type ClusterPointInstance = {
  position: Vector3;
  clusterSize: number;
  opacity: number;
  hover: number;
};

export type ClusterOverlayPointsParameters = {
  textures: ClusterSpriteTextures;
  minPixelSize: number;
  maxPixelSize: number;
  radius: number;
};

export class ClusterOverlayPointsObject extends Group {
  private readonly _geometry: BufferGeometry;
  private readonly _positionBuffer: Float32Array;
  private readonly _positionAttribute: BufferAttribute;
  private readonly _digitsBuffer: Float32Array;
  private readonly _digitsAttribute: BufferAttribute;
  private readonly _metaBuffer: Float32Array;
  private readonly _metaAttribute: BufferAttribute;
  private readonly _points: {
    frontPoints: Points<BufferGeometry, RawShaderMaterial>;
    backPoints: Points<BufferGeometry, RawShaderMaterial>;
  };
  private _modelTransform: Matrix4;

  constructor(maxNumberOfPoints: number, materialParameters: ClusterOverlayPointsParameters) {
    super();
    const geometry = new BufferGeometry();
    this._positionBuffer = new Float32Array(maxNumberOfPoints * 3);
    this._positionAttribute = new BufferAttribute(this._positionBuffer, 3);
    this._digitsBuffer = new Float32Array(maxNumberOfPoints * 4);
    this._digitsAttribute = new BufferAttribute(this._digitsBuffer, 4);
    this._metaBuffer = new Float32Array(maxNumberOfPoints * 3);
    this._metaAttribute = new BufferAttribute(this._metaBuffer, 3);
    this._modelTransform = new Matrix4();
    geometry.setAttribute('position', this._positionAttribute);
    geometry.setAttribute('digits', this._digitsAttribute);
    geometry.setAttribute('clusterMeta', this._metaAttribute);
    geometry.setDrawRange(0, 0);

    const { textures, minPixelSize, maxPixelSize, radius } = materialParameters;

    const frontMaterial = this.createClusterMaterial(
      textures,
      DEFAULT_OVERLAY_FRONT_OPACITY,
      LessEqualDepth,
      minPixelSize,
      maxPixelSize,
      radius,
      false
    );
    const backMaterial = this.createClusterMaterial(
      textures,
      DEFAULT_OVERLAY_BACK_OPACITY,
      GreaterDepth,
      minPixelSize,
      maxPixelSize,
      radius,
      false
    );

    const frontPoints = this.initializePoints(geometry, frontMaterial);
    const backPoints = this.initializePoints(geometry, backMaterial);

    this.add(backPoints);
    this.add(frontPoints);

    this._geometry = geometry;
    this._points = { frontPoints, backPoints };
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

  public setClusters(clusters: ClusterPointInstance[]): void {
    if (clusters.length * 3 > this._positionBuffer.length) {
      throw new Error('Cluster array length exceeds the maximum number of points');
    }

    for (let index = 0; index < clusters.length; index++) {
      const cluster = clusters[index];
      this._positionBuffer[index * 3 + 0] = cluster.position.x;
      this._positionBuffer[index * 3 + 1] = cluster.position.y;
      this._positionBuffer[index * 3 + 2] = cluster.position.z;

      const encoded = encodeClusterDigits(cluster.clusterSize);
      this._digitsBuffer[index * 4 + 0] = encoded.digits[0];
      this._digitsBuffer[index * 4 + 1] = encoded.digits[1];
      this._digitsBuffer[index * 4 + 2] = encoded.digits[2];
      this._digitsBuffer[index * 4 + 3] = encoded.digits[3];

      this._metaBuffer[index * 3 + 0] = encoded.digitCount;
      this._metaBuffer[index * 3 + 1] = cluster.opacity;
      this._metaBuffer[index * 3 + 2] = cluster.hover;
    }

    this._positionAttribute.clearUpdateRanges();
    this._positionAttribute.updateRanges.push({ start: 0, count: clusters.length * 3 });
    this._positionAttribute.needsUpdate = true;

    this._digitsAttribute.clearUpdateRanges();
    this._digitsAttribute.updateRanges.push({ start: 0, count: clusters.length * 4 });
    this._digitsAttribute.needsUpdate = true;

    this._metaAttribute.clearUpdateRanges();
    this._metaAttribute.updateRanges.push({ start: 0, count: clusters.length * 3 });
    this._metaAttribute.needsUpdate = true;

    this._geometry.setDrawRange(0, clusters.length);
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
    const points = new Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = 4;
    points.onBeforeRender = renderer => {
      setUniforms(renderer, material);
    };
    return points;
  }

  private createClusterMaterial(
    textures: ClusterSpriteTextures,
    collectionOpacity: number,
    depthFunction: DepthModes,
    minPixelSize: number,
    maxPixelSize: number,
    radius: number,
    depthWrite: boolean
  ): RawShaderMaterial {
    return new RawShaderMaterial({
      uniforms: {
        ringTexture: { value: textures.ring },
        hoverRingTexture: { value: textures.ringHover },
        digitAtlas: { value: textures.digitAtlas },
        radius: { value: radius },
        renderSize: { value: new Vector2(1, 1) },
        collectionOpacity: { value: collectionOpacity },
        renderDownScale: { value: 1 },
        pixelSizeRange: { value: new Vector2(minPixelSize, maxPixelSize) }
      },
      vertexShader: spriteClusterVert,
      fragmentShader: spriteClusterFrag,
      depthTest: true,
      depthWrite: depthWrite,
      depthFunc: depthFunction,
      glslVersion: GLSL3,
      transparent: true
    });
  }
}

function setUniforms(renderer: WebGLRenderer, material: ShaderMaterial): void {
  renderer.getDrawingBufferSize(material.uniforms.renderSize.value);
  material.uniforms.renderDownScale.value = material.uniforms.renderSize.value.x / renderer.domElement.clientWidth;
}
