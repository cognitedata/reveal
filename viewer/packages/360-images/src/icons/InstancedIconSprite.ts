/*!
 * Copyright 2023 Cognite AS
 */

import glsl from 'glslify';
import {
  BufferGeometry,
  Color,
  DepthModes,
  GLSL3,
  GreaterDepth,
  Group,
  LessEqualDepth,
  Points,
  RawShaderMaterial,
  ShaderMaterial,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import image360IconVert from './image360Icon.vert';
import image360IconFrag from './image360Icon.frag';

export class InstancedIconSprite extends Group {
  private readonly _geometry: BufferGeometry;
  private readonly _frontMaterial: RawShaderMaterial;
  private readonly _backMaterial: RawShaderMaterial;
  constructor(points: Vector3[], spriteTexture: Texture, minPixelSize: number, maxPixelSize: number) {
    super();
    const geometry = new BufferGeometry();
    geometry.setFromPoints(points);
    const frontMaterial = this.createIconsMaterial(spriteTexture, 1, LessEqualDepth, minPixelSize, maxPixelSize);
    const backMaterial = this.createIconsMaterial(spriteTexture, 0.5, GreaterDepth, minPixelSize, maxPixelSize);
    const [frontPoints, backPoints] = this.initializePoints(geometry, frontMaterial, backMaterial);
    this.add(frontPoints);
    this.add(backPoints);

    this._geometry = geometry;
    this._frontMaterial = frontMaterial;
    this._backMaterial = backMaterial;
  }

  public dispose(): void {
    this._frontMaterial.dispose();
    this._backMaterial.dispose();
    this._geometry.dispose();
  }

  private initializePoints(
    geometry: BufferGeometry,
    frontMaterial: ShaderMaterial,
    backMaterial: ShaderMaterial
  ): [Points, Points] {
    const frontPoints = createPoints(geometry, frontMaterial);
    frontPoints.onBeforeRender = renderer => {
      setUniforms(renderer, frontMaterial);
    };

    const backPoints = createPoints(geometry, backMaterial);
    backPoints.onBeforeRender = renderer => {
      setUniforms(renderer, backMaterial);
    };

    return [frontPoints, backPoints];

    function createPoints(geometry: BufferGeometry, material: ShaderMaterial): Points {
      const points = new Points(geometry, material);
      points.renderOrder = 4;
      return points;
    }

    function setUniforms(renderer: WebGLRenderer, material: ShaderMaterial): void {
      renderer.getSize(material.uniforms.renderSize.value);
      material.uniforms.renderDownScale.value = material.uniforms.renderSize.value.x / renderer.domElement.clientWidth;
    }
  }

  private createIconsMaterial(
    texture: Texture,
    collectionOpacity: number,
    depthFunction: DepthModes,
    minPixelSize: number,
    maxPixelSize: number
  ): RawShaderMaterial {
    return new RawShaderMaterial({
      uniforms: {
        map: { value: texture },
        colorTint: { value: new Color(1, 1, 1) },
        renderSize: { value: new Vector2(1, 1) },
        collectionOpacity: { value: collectionOpacity },
        renderDownScale: { value: 1 },
        pixelSizeRange: { value: new Vector2(minPixelSize, maxPixelSize) }
      },
      vertexShader: glsl(image360IconVert),
      fragmentShader: glsl(image360IconFrag),
      depthTest: true,
      depthWrite: false,
      depthFunc: depthFunction,
      glslVersion: GLSL3,
      transparent: true
    });
  }
}
