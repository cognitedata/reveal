/*!
 * Adapted from pnext/three-loader (https://github.com/pnext/three-loader)
 */
import type { Camera, PerspectiveCamera, DataTexture, WebGLRenderer } from 'three';
import {
  AdditiveBlending,
  GLSL3,
  LessEqualDepth,
  NearestFilter,
  NoBlending,
  RawShaderMaterial,
  Texture,
  Vector2,
  Vector3
} from 'three';
import {
  COLOR_WHITE,
  DEFAULT_MAX_POINT_SIZE,
  DEFAULT_MIN_POINT_SIZE,
  OBJECT_STYLING_TEXTURE_HEIGHT,
  OBJECT_STYLING_TEXTURE_WIDTH,
  PERSPECTIVE_CAMERA
} from './constants';
import { DEFAULT_CLASSIFICATION } from './classification';
import { PointColorType, PointShape, PointSizeType } from './enums';
import { generateClassificationTexture, generateDataTexture, generateGradientTexture } from './texture-generation';
import type { PointClassification, IUniform, OctreeMaterialParams } from './types';
import { SpectralGradient } from './gradients/SpectralGradient';
import { PointCloudObjectAppearanceTexture } from './PointCloudObjectAppearanceTexture';
import type { PointCloudObjectIdMaps } from './PointCloudObjectIdMaps';
import { pointCloudShaders } from '../rendering/shaders';

export interface IPointCloudMaterialParameters {
  size: number;
  minSize: number;
  maxSize: number;
  objectsMaps: PointCloudObjectIdMaps;
}

export interface IPointCloudMaterialUniforms {
  classificationLUT: IUniform<Texture>;
  fov: IUniform<number>;
  gradient: IUniform<Texture>;
  heightMax: IUniform<number>;
  heightMin: IUniform<number>;
  intensityBrightness: IUniform<number>;
  intensityContrast: IUniform<number>;
  intensityGamma: IUniform<number>;
  intensityRange: IUniform<[number, number]>;
  isLeafNode: IUniform<boolean>;
  level: IUniform<number>;
  maxSize: IUniform<number>;
  minSize: IUniform<number>;
  objectIdLUT: IUniform<Texture>;
  octreeSize: IUniform<number>;
  pcIndex: IUniform<number>;
  screenHeight: IUniform<number>;
  screenWidth: IUniform<number>;
  size: IUniform<number>;
  spacing: IUniform<number>;
  visibleNodes: IUniform<Texture>;
  vnStart: IUniform<number>;
}

const SIZE_TYPE_DEFS = {
  [PointSizeType.Fixed]: 'fixed_point_size',
  [PointSizeType.Attenuated]: 'attenuated_point_size',
  [PointSizeType.Adaptive]: 'adaptive_point_size'
};

const SHAPE_DEFS = {
  [PointShape.Square]: 'square_point_shape',
  [PointShape.Circle]: 'circle_point_shape',
  [PointShape.Paraboloid]: 'paraboloid_point_shape'
};

const COLOR_DEFS = {
  [PointColorType.Rgb]: 'color_type_rgb',
  [PointColorType.Depth]: 'color_type_depth',
  [PointColorType.Height]: 'color_type_height',
  [PointColorType.Intensity]: 'color_type_intensity',
  [PointColorType.Lod]: 'color_type_lod',
  [PointColorType.PointIndex]: 'color_type_point_index',
  [PointColorType.Classification]: 'color_type_classification'
};

export class PointCloudMaterial extends RawShaderMaterial {
  private static readonly helperVec3 = new Vector3();

  /**
   * Use the drawing buffer size instead of the dom client width and height when passing the screen height and screen width uniforms to the
   * shader. This is useful if you have offscreen canvases (which in some browsers return 0 as client width and client height).
   */
  useDrawingBufferSize = false;
  lights = false;
  fog = false;
  visibleNodesTexture: DataTexture | undefined;
  visibleNodeTextureOffsets: Map<string, number> = new Map<string, number>();

  private readonly _gradient = SpectralGradient;
  private gradientTexture: Texture | undefined = generateGradientTexture(this._gradient);

  private _objectAppearanceTexture = new PointCloudObjectAppearanceTexture(
    OBJECT_STYLING_TEXTURE_WIDTH,
    OBJECT_STYLING_TEXTURE_HEIGHT
  );

  private _classification: PointClassification = DEFAULT_CLASSIFICATION;
  private classificationTexture: Texture | undefined = generateClassificationTexture(this._classification);

  uniforms: IPointCloudMaterialUniforms & Record<string, IUniform<any>> = {
    classificationLUT: makeUniform('t', this.classificationTexture || new Texture()),
    fov: makeUniform('f', 1.0),
    gradient: makeUniform('t', this.gradientTexture || new Texture()),
    heightMax: makeUniform('f', 1.0),
    heightMin: makeUniform('f', 0.0),
    intensityBrightness: makeUniform('f', 0),
    intensityContrast: makeUniform('f', 0),
    intensityGamma: makeUniform('f', 1),
    intensityRange: makeUniform('fv', [0, 256] as [number, number]),
    isLeafNode: makeUniform('b', false),
    level: makeUniform('f', 0.0),
    maxSize: makeUniform('f', DEFAULT_MAX_POINT_SIZE),
    minSize: makeUniform('f', DEFAULT_MIN_POINT_SIZE),
    objectIdLUT: makeUniform('t', this._objectAppearanceTexture.objectStyleTexture),
    octreeSize: makeUniform('f', 0),
    pcIndex: makeUniform('f', 0),
    screenHeight: makeUniform('f', 1.0),
    screenWidth: makeUniform('f', 1.0),
    size: makeUniform('f', 1),
    spacing: makeUniform('f', 1.0),
    // @ts-ignore
    visibleNodes: makeUniform('t', this.visibleNodesTexture || new Texture()),
    vnStart: makeUniform('f', 0.0)
  };

  get fov(): number {
    return this.getUniform('fov');
  }
  set fov(value: number) {
    if (value !== this.getUniform('fov')) {
      this.setUniform('fov', value);
    }
  }

  get heightMax(): number {
    return this.getUniform('heightMax');
  }
  set heightMax(value: number) {
    if (value !== this.getUniform('heightMax')) {
      this.setUniform('heightMax', value);
    }
  }

  get heightMin(): number {
    return this.getUniform('heightMin');
  }
  set heightMin(value: number) {
    if (value !== this.getUniform('heightMin')) {
      this.setUniform('heightMin', value);
    }
  }

  get intensityBrightness(): number {
    return this.getUniform('intensityBrightness');
  }
  set intensityBrightness(value: number) {
    if (value !== this.getUniform('intensityBrightness')) {
      this.setUniform('intensityBrightness', value);
    }
  }

  get intensityContrast(): number {
    return this.getUniform('intensityContrast');
  }
  set intensityContrast(value: number) {
    if (value !== this.getUniform('intensityContrast')) {
      this.setUniform('intensityContrast', value);
    }
  }

  get intensityGamma(): number {
    return this.getUniform('intensityGamma');
  }
  set intensityGamma(value: number) {
    if (value !== this.getUniform('intensityGamma')) {
      this.setUniform('intensityGamma', value);
    }
  }

  get intensityRange(): [number, number] {
    return this.getUniform('intensityRange');
  }
  set intensityRange(value: [number, number]) {
    if (value !== this.getUniform('intensityRange')) {
      this.setUniform('intensityRange', value);
    }
  }

  get maxSize(): number {
    return this.getUniform('maxSize');
  }
  set maxSize(value: number) {
    if (value !== this.getUniform('maxSize')) {
      this.setUniform('maxSize', value);
    }
  }

  get minSize(): number {
    return this.getUniform('minSize');
  }
  set minSize(value: number) {
    if (value !== this.getUniform('minSize')) {
      this.setUniform('minSize', value);
    }
  }

  get octreeSize(): number {
    return this.getUniform('octreeSize');
  }
  set octreeSize(value: number) {
    if (value !== this.getUniform('octreeSize')) {
      this.setUniform('octreeSize', value);
    }
  }

  get screenHeight(): number {
    return this.getUniform('screenHeight');
  }
  set screenHeight(value: number) {
    if (value !== this.getUniform('screenHeight')) {
      this.setUniform('screenHeight', value);
    }
  }

  get screenWidth(): number {
    return this.getUniform('screenWidth');
  }
  set screenWidth(value: number) {
    if (value !== this.getUniform('screenWidth')) {
      this.setUniform('screenWidth', value);
    }
  }

  get size(): number {
    return this.getUniform('size');
  }
  set size(value: number) {
    if (value !== this.getUniform('size')) {
      this.setUniform('size', value);
    }
  }

  get spacing(): number {
    return this.getUniform('spacing');
  }
  set spacing(value: number) {
    if (value !== this.getUniform('spacing')) {
      this.setUniform('spacing', value);
    }
  }

  private _weighted: boolean = false;
  get weighted(): boolean {
    return this._weighted;
  }
  set weighted(value: boolean) {
    if (value !== this._weighted) {
      this._weighted = value;
      this.updateShaderSource();
    }
  }

  private _hqDepthPass: boolean = false;
  get hqDepthPass(): boolean {
    return this._hqDepthPass;
  }
  set hqDepthPass(value: boolean) {
    if (value !== this._hqDepthPass) {
      this._hqDepthPass = value;
      this.updateShaderSource();
    }
  }

  private _pointColorType: PointColorType = PointColorType.Rgb;
  get pointColorType(): PointColorType {
    return this._pointColorType;
  }
  set pointColorType(value: PointColorType) {
    if (value !== this._pointColorType) {
      this._pointColorType = value;
      this.updateShaderSource();
    }
  }

  private _pointSizeType: PointSizeType = PointSizeType.Adaptive;
  get pointSizeType(): PointSizeType {
    return this._pointSizeType;
  }
  set pointSizeType(value: PointSizeType) {
    if (value !== this._pointSizeType) {
      this._pointSizeType = value;
      this.updateShaderSource();
    }
  }

  private _useEDL: boolean = false;
  get useEDL(): boolean {
    return this._useEDL;
  }
  set useEDL(value: boolean) {
    if (value !== this._useEDL) {
      this._useEDL = value;
      this.updateShaderSource();
    }
  }

  private _shape: PointShape = PointShape.Circle;
  get shape(): PointShape {
    return this._shape;
  }
  set shape(value: PointShape) {
    if (value !== this._shape) {
      this._shape = value;
      this.updateShaderSource();
    }
  }

  attributes = {
    position: { type: 'fv', value: [] as const },
    color: { type: 'fv', value: [] as const },
    intensity: { type: 'f', value: [] as const },
    classification: { type: 'f', value: [] as const },
    objectId: { type: 'f', value: [] as const },
    indices: { type: 'fv', value: [] as const }
  };

  constructor(parameters: Partial<IPointCloudMaterialParameters> = {}) {
    super({
      glslVersion: GLSL3
    });

    const tex = (this.visibleNodesTexture = generateDataTexture(2048, 1, COLOR_WHITE, 0x0));
    tex.minFilter = NearestFilter;
    tex.magFilter = NearestFilter;
    this.setUniform('visibleNodes', tex);

    this.size = getValid(parameters.size, 1.0);
    this.minSize = getValid(parameters.minSize, DEFAULT_MIN_POINT_SIZE);
    this.maxSize = getValid(parameters.maxSize, DEFAULT_MAX_POINT_SIZE);

    this.classification = DEFAULT_CLASSIFICATION;

    this.vertexColors = true;

    if (parameters.objectsMaps) {
      this._objectAppearanceTexture.setObjectsMaps(parameters.objectsMaps);
    }

    this.updateShaderSource();
  }

  dispose(): void {
    super.dispose();

    if (this.gradientTexture) {
      this.gradientTexture.dispose();
      this.gradientTexture = undefined;
    }

    if (this.visibleNodesTexture) {
      this.visibleNodesTexture.dispose();
      this.visibleNodesTexture = undefined;
    }

    this.clearVisibleNodeTextureOffsets();

    if (this.classificationTexture) {
      this.classificationTexture.dispose();
      this.classificationTexture = undefined;
    }
  }

  clearVisibleNodeTextureOffsets(): void {
    this.visibleNodeTextureOffsets.clear();
  }

  updateShaderSource(): void {
    this.vertexShader = this.applyDefines(pointCloudShaders.pointcloud.vertex);
    this.fragmentShader = this.applyDefines(pointCloudShaders.pointcloud.fragment);

    this.blending = NoBlending;
    this.transparent = false;
    this.depthTest = true;
    this.depthWrite = true;
    this.depthFunc = LessEqualDepth;

    if (this.weighted) {
      this.blending = AdditiveBlending;
      this.transparent = true;
      this.depthTest = true;
      this.depthWrite = false;
      this.depthFunc = LessEqualDepth;
    }

    this.needsUpdate = true;
  }

  applyDefines(shaderSrc: string): string {
    const parts: string[] = [];

    function define(value: string | undefined) {
      if (value) {
        parts.push(`#define ${value}`);
      }
    }

    define(SIZE_TYPE_DEFS[this.pointSizeType]);
    define(SHAPE_DEFS[this.shape]);
    define(COLOR_DEFS[this.pointColorType]);

    if (this.useEDL) {
      define('use_edl');
    }

    if (this.weighted) {
      define('weighted_splats');
    }

    if (this.hqDepthPass) {
      define('hq_depth_pass');
    }

    define(`OBJECT_STYLING_TEXTURE_WIDTH ${OBJECT_STYLING_TEXTURE_WIDTH}`);

    parts.push(shaderSrc);

    return parts.join('\n');
  }

  get objectAppearanceTexture(): PointCloudObjectAppearanceTexture {
    return this._objectAppearanceTexture;
  }

  set objectAppearanceTexture(texture: PointCloudObjectAppearanceTexture) {
    this._objectAppearanceTexture = texture;
    this.uniforms.objectIdLUT = makeUniform('t', this._objectAppearanceTexture.objectStyleTexture);
  }

  get classification(): PointClassification {
    return this._classification;
  }

  set classification(value: PointClassification) {
    const copy = {} as PointClassification;
    for (const key of Object.keys(value)) {
      copy[key] = value[key as number | 'DEFAULT'].clone();
    }

    this._classification = copy;
    this.recomputeClassification();
  }

  private recomputeClassification(): void {
    this.classificationTexture?.dispose();
    this.classificationTexture = generateClassificationTexture(this._classification);
    this.setUniform('classificationLUT', this.classificationTexture);
  }

  get elevationRange(): [number, number] {
    return [this.heightMin, this.heightMax];
  }

  set elevationRange(value: [number, number]) {
    this.heightMin = value[0];
    this.heightMax = value[1];
  }

  getUniform<K extends keyof IPointCloudMaterialUniforms>(name: K): IPointCloudMaterialUniforms[K]['value'] {
    return this.uniforms === undefined ? (undefined as any) : this.uniforms[name].value;
  }

  setUniform<K extends keyof IPointCloudMaterialUniforms>(
    name: K,
    value: IPointCloudMaterialUniforms[K]['value']
  ): void {
    if (this.uniforms === undefined) {
      return;
    }

    const uObj = this.uniforms[name];
    if (value !== uObj.value) {
      uObj.value = value;
    }
  }

  onBeforeRender(renderer: WebGLRenderer): void {
    this._objectAppearanceTexture.onBeforeRender();

    const renderSize = renderer.getDrawingBufferSize(new Vector2());
    this.screenWidth = renderSize.x;
    this.screenHeight = renderSize.y;
  }

  updateMaterial(octreeParams: OctreeMaterialParams, visibilityTextureData: Uint8Array, camera: Camera): void {
    if (camera.type === PERSPECTIVE_CAMERA) {
      this.fov = (camera as PerspectiveCamera).fov * (Math.PI / 180);
    } else {
      this.fov = Math.PI / 2; // will result in slope = 1 in the shader
    }

    const maxScale = Math.max(octreeParams.scale.x, octreeParams.scale.y, octreeParams.scale.z);
    this.spacing = octreeParams.spacing * maxScale;
    this.octreeSize = octreeParams.boundingBox.getSize(PointCloudMaterial.helperVec3).x;

    if (this.pointSizeType === PointSizeType.Adaptive || this.pointColorType === PointColorType.Lod) {
      this.updateVisibilityTextureData(visibilityTextureData);
    }
  }

  private updateVisibilityTextureData(textureData: Uint8Array): void {
    const texture = this.visibleNodesTexture;

    if (texture) {
      texture.image.data?.set(textureData);
      texture.needsUpdate = true;
    }
  }
}

function makeUniform<T>(type: string, value: T): IUniform<T> {
  return { type, value };
}

function getValid<T>(a: T | undefined, b: T): T {
  return a === undefined ? b : a;
}
