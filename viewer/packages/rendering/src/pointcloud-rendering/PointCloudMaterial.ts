/*!
 * Adapted from pnext/three-loader (https://github.com/pnext/three-loader)
 */
import {
  AdditiveBlending,
  Camera,
  Color,
  GLSL3,
  LessEqualDepth,
  NearestFilter,
  NoBlending,
  PerspectiveCamera,
  RawShaderMaterial,
  Texture,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer
} from 'three';
import {
  COLOR_WHITE,
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_MAX_POINT_SIZE,
  DEFAULT_MIN_POINT_SIZE,
  DEFAULT_RGB_BRIGHTNESS,
  DEFAULT_RGB_CONTRAST,
  DEFAULT_RGB_GAMMA,
  OBJECT_STYLING_TEXTURE_HEIGHT,
  OBJECT_STYLING_TEXTURE_WIDTH,
  PERSPECTIVE_CAMERA
} from './constants';
import { DEFAULT_CLASSIFICATION } from './classification';
import {
  PointColorType,
  PointShape,
  PointSizeType,
  TreeType,
  PointOpacityType,
  ClipMode,
  NormalFilteringMode,
  PointCloudMixingMode
} from './enums';
import { generateClassificationTexture, generateDataTexture, generateGradientTexture } from './texture-generation';
import { IClassification, IUniform, OctreeMaterialParams, IClipBox } from './types';
import { SpectralGradient } from './gradients/SpectralGradient';
import { PointCloudObjectAppearanceTexture } from './PointCloudObjectAppearanceTexture';
import { PointCloudObjectIdMaps } from '@reveal/rendering';
import { pointCloudShaders } from '../rendering/shaders';

export interface IPointCloudMaterialParameters {
  size: number;
  minSize: number;
  maxSize: number;
  treeType: TreeType;
  objectsMaps: PointCloudObjectIdMaps;
}

export interface IPointCloudMaterialUniforms {
  bbSize: IUniform<[number, number, number]>;
  blendDepthSupplement: IUniform<number>;
  blendHardness: IUniform<number>;
  classificationLUT: IUniform<Texture>;
  clipBoxCount: IUniform<number>;
  clipBoxes: IUniform<Float32Array>;
  depthMap: IUniform<Texture | null>;
  diffuse: IUniform<[number, number, number]>;
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
  opacity: IUniform<number>;
  pcIndex: IUniform<number>;
  rgbBrightness: IUniform<number>;
  rgbContrast: IUniform<number>;
  rgbGamma: IUniform<number>;
  screenHeight: IUniform<number>;
  screenWidth: IUniform<number>;
  size: IUniform<number>;
  spacing: IUniform<number>;
  toModel: IUniform<number[]>;
  transition: IUniform<number>;
  uColor: IUniform<Color>;
  visibleNodes: IUniform<Texture>;
  vnStart: IUniform<number>;
  wClassification: IUniform<number>;
  wElevation: IUniform<number>;
  wIntensity: IUniform<number>;
  wReturnNumber: IUniform<number>;
  wRGB: IUniform<number>;
  wSourceID: IUniform<number>;
  opacityAttenuation: IUniform<number>;
  filterByNormalThreshold: IUniform<number>;
  highlightedPointCoordinate: IUniform<Vector3>;
  highlightedPointColor: IUniform<Vector4>;
  enablePointHighlighting: IUniform<boolean>;
  highlightedPointScale: IUniform<number>;
  normalFilteringMode: IUniform<number>;
  backgroundMap: IUniform<Texture | null>;
  pointCloudID: IUniform<number>;
  pointCloudMixAngle: IUniform<number>;
  stripeDistanceX: IUniform<number>;
  stripeDistanceY: IUniform<number>;
  stripeDivisorX: IUniform<number>;
  stripeDivisorY: IUniform<number>;
  pointCloudMixingMode: IUniform<number>;
}

const TREE_TYPE_DEFS = {
  [TreeType.Octree]: 'tree_type_octree',
  [TreeType.KdTree]: 'tree_type_kdtree'
};

const SIZE_TYPE_DEFS = {
  [PointSizeType.Fixed]: 'fixed_point_size',
  [PointSizeType.Attenuated]: 'attenuated_point_size',
  [PointSizeType.Adaptive]: 'adaptive_point_size'
};

const OPACITY_DEFS = {
  [PointOpacityType.Attenuated]: 'attenuated_opacity',
  [PointOpacityType.Fixed]: 'fixed_opacity'
};

const SHAPE_DEFS = {
  [PointShape.Square]: 'square_point_shape',
  [PointShape.Circle]: 'circle_point_shape',
  [PointShape.Paraboloid]: 'paraboloid_point_shape'
};

const COLOR_DEFS = {
  [PointColorType.Rgb]: 'color_type_rgb',
  [PointColorType.Color]: 'color_type_color',
  [PointColorType.Depth]: 'color_type_depth',
  [PointColorType.Height]: 'color_type_height',
  [PointColorType.Intensity]: 'color_type_intensity',
  [PointColorType.IntensityGradient]: 'color_type_intensity_gradient',
  [PointColorType.Lod]: 'color_type_lod',
  [PointColorType.PointIndex]: 'color_type_point_index',
  [PointColorType.Classification]: 'color_type_classification',
  [PointColorType.ReturnNumber]: 'color_type_return_number',
  [PointColorType.Source]: 'color_type_source',
  [PointColorType.Normal]: 'color_type_normal',
  [PointColorType.Phong]: 'color_type_phong',
  [PointColorType.RgbHeight]: 'color_type_rgb_height',
  [PointColorType.Composite]: 'color_type_composite'
};

const CLIP_MODE_DEFS = {
  [ClipMode.DISABLED]: 'clip_disabled',
  [ClipMode.CLIP_OUTSIDE]: 'clip_outside',
  [ClipMode.HIGHLIGHT_INSIDE]: 'clip_highlight_inside'
};

export class PointCloudMaterial extends RawShaderMaterial {
  private static readonly helperVec3 = new Vector3();
  private static readonly helperVec2 = new Vector2();

  /**
   * Use the drawing buffer size instead of the dom client width and height when passing the screen height and screen width uniforms to the
   * shader. This is useful if you have offscreen canvases (which in some browsers return 0 as client width and client height).
   */
  useDrawingBufferSize = false;
  lights = false;
  fog = false;
  numClipBoxes: number = 0;
  clipBoxes: IClipBox[] = [];
  visibleNodesTexture: Texture | undefined;
  visibleNodeTextureOffsets = new Map<string, number>();

  private readonly _gradient = SpectralGradient;
  private gradientTexture: Texture | undefined = generateGradientTexture(this._gradient);

  private readonly _objectAppearanceTexture = new PointCloudObjectAppearanceTexture(
    OBJECT_STYLING_TEXTURE_WIDTH,
    OBJECT_STYLING_TEXTURE_HEIGHT
  );

  private _classification: IClassification = DEFAULT_CLASSIFICATION;
  private classificationTexture: Texture | undefined = generateClassificationTexture(this._classification);

  uniforms: IPointCloudMaterialUniforms & Record<string, IUniform<any>> = {
    bbSize: makeUniform('fv', [0, 0, 0] as [number, number, number]),
    blendDepthSupplement: makeUniform('f', 0.0),
    blendHardness: makeUniform('f', 2.0),
    classificationLUT: makeUniform('t', this.classificationTexture || new Texture()),
    clipBoxCount: makeUniform('f', 0),
    clipBoxes: makeUniform('Matrix4fv', new Float32Array()),
    depthMap: makeUniform('t', null),
    diffuse: makeUniform('fv', [1, 1, 1] as [number, number, number]),
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
    opacity: makeUniform('f', 1.0),
    pcIndex: makeUniform('f', 0),
    rgbBrightness: makeUniform('f', DEFAULT_RGB_BRIGHTNESS),
    rgbContrast: makeUniform('f', DEFAULT_RGB_CONTRAST),
    rgbGamma: makeUniform('f', DEFAULT_RGB_GAMMA),
    screenHeight: makeUniform('f', 1.0),
    screenWidth: makeUniform('f', 1.0),
    size: makeUniform('f', 1),
    spacing: makeUniform('f', 1.0),
    toModel: makeUniform('Matrix4f', []),
    transition: makeUniform('f', 0.5),
    uColor: makeUniform('c', COLOR_WHITE),
    // @ts-ignore
    visibleNodes: makeUniform('t', this.visibleNodesTexture || new Texture()),
    vnStart: makeUniform('f', 0.0),
    wClassification: makeUniform('f', 0),
    wElevation: makeUniform('f', 0),
    wIntensity: makeUniform('f', 0),
    wReturnNumber: makeUniform('f', 0),
    wRGB: makeUniform('f', 1),
    wSourceID: makeUniform('f', 0),
    opacityAttenuation: makeUniform('f', 1),
    filterByNormalThreshold: makeUniform('f', 0),
    highlightedPointCoordinate: makeUniform('fv', new Vector3()),
    highlightedPointColor: makeUniform('fv', DEFAULT_HIGHLIGHT_COLOR.clone()),
    enablePointHighlighting: makeUniform('b', true),
    highlightedPointScale: makeUniform('f', 2.0),
    backgroundMap: makeUniform('t', null),
    normalFilteringMode: makeUniform('i', NormalFilteringMode.ABSOLUTE_NORMAL_FILTERING_MODE),
    pointCloudID: makeUniform('f', 2),
    pointCloudMixingMode: makeUniform('i', PointCloudMixingMode.CHECKBOARD),
    stripeDistanceX: makeUniform('f', 5),
    stripeDistanceY: makeUniform('f', 5),
    stripeDivisorX: makeUniform('f', 2),
    stripeDivisorY: makeUniform('f', 2),
    pointCloudMixAngle: makeUniform('f', 31)
  };

  @uniform('bbSize') bbSize!: [number, number, number];
  @uniform('depthMap') depthMap!: Texture | undefined;
  @uniform('fov') fov!: number;
  @uniform('heightMax') heightMax!: number;
  @uniform('heightMin') heightMin!: number;
  @uniform('intensityBrightness') intensityBrightness!: number;
  @uniform('intensityContrast') intensityContrast!: number;
  @uniform('intensityGamma') intensityGamma!: number;
  @uniform('intensityRange') intensityRange!: [number, number];
  @uniform('maxSize') maxSize!: number;
  @uniform('minSize') minSize!: number;
  @uniform('octreeSize') octreeSize!: number;
  @uniform('opacity', true) opacity!: number;
  @uniform('rgbBrightness', true) rgbBrightness!: number;
  @uniform('rgbContrast', true) rgbContrast!: number;
  @uniform('rgbGamma', true) rgbGamma!: number;
  @uniform('screenHeight') screenHeight!: number;
  @uniform('screenWidth') screenWidth!: number;
  @uniform('size') size!: number;
  @uniform('spacing') spacing!: number;
  @uniform('transition') transition!: number;
  @uniform('uColor') color!: Color;
  @uniform('wClassification') weightClassification!: number;
  @uniform('wElevation') weightElevation!: number;
  @uniform('wIntensity') weightIntensity!: number;
  @uniform('wReturnNumber') weightReturnNumber!: number;
  @uniform('wRGB') weightRGB!: number;
  @uniform('wSourceID') weightSourceID!: number;
  @uniform('opacityAttenuation') opacityAttenuation!: number;
  @uniform('filterByNormalThreshold') filterByNormalThreshold!: number;
  @uniform('highlightedPointCoordinate') highlightedPointCoordinate!: Vector3;
  @uniform('highlightedPointColor') highlightedPointColor!: Vector4;
  @uniform('enablePointHighlighting') enablePointHighlighting!: boolean;
  @uniform('highlightedPointScale') highlightedPointScale!: number;
  @uniform('normalFilteringMode') normalFilteringMode!: number;
  @uniform('backgroundMap') backgroundMap!: Texture | undefined;
  @uniform('pointCloudID') pointCloudID!: number;
  @uniform('pointCloudMixingMode') pointCloudMixingMode!: number;
  @uniform('stripeDistanceX') stripeDistanceX!: number;
  @uniform('stripeDistanceY') stripeDistanceY!: number;
  @uniform('stripeDivisorX') stripeDivisorX!: number;
  @uniform('stripeDivisorY') stripeDivisorY!: number;
  @uniform('pointCloudMixAngle') pointCloudMixAngle!: number;

  @requiresShaderUpdate() useClipBox: boolean = false;
  @requiresShaderUpdate() weighted: boolean = false;
  @requiresShaderUpdate() hqDepthPass: boolean = false;
  @requiresShaderUpdate() pointColorType: PointColorType = PointColorType.Rgb;
  @requiresShaderUpdate() pointSizeType: PointSizeType = PointSizeType.Adaptive;
  @requiresShaderUpdate() clipMode: ClipMode = ClipMode.DISABLED;
  @requiresShaderUpdate() useEDL: boolean = false;
  @requiresShaderUpdate() shape: PointShape = PointShape.Circle;
  @requiresShaderUpdate() treeType: TreeType = TreeType.Octree;
  @requiresShaderUpdate() pointOpacityType: PointOpacityType = PointOpacityType.Fixed;
  @requiresShaderUpdate() useFilterByNormal: boolean = false;
  @requiresShaderUpdate() useTextureBlending: boolean = false;
  @requiresShaderUpdate() usePointCloudMixing: boolean = false;
  @requiresShaderUpdate() highlightPoint: boolean = false;

  attributes = {
    position: { type: 'fv', value: [] },
    color: { type: 'fv', value: [] },
    normal: { type: 'fv', value: [] },
    intensity: { type: 'f', value: [] },
    classification: { type: 'f', value: [] },
    returnNumber: { type: 'f', value: [] },
    numberOfReturns: { type: 'f', value: [] },
    pointSourceID: { type: 'f', value: [] },
    objectId: { type: 'f', value: [] },
    indices: { type: 'fv', value: [] }
  };

  constructor(parameters: Partial<IPointCloudMaterialParameters> = {}) {
    super({
      glslVersion: GLSL3
    });

    const tex = (this.visibleNodesTexture = generateDataTexture(2048, 1, COLOR_WHITE));
    tex.minFilter = NearestFilter;
    tex.magFilter = NearestFilter;
    this.setUniform('visibleNodes', tex);

    this.treeType = getValid(parameters.treeType, TreeType.Octree);
    this.size = getValid(parameters.size, 1.0);
    this.minSize = getValid(parameters.minSize, DEFAULT_MIN_POINT_SIZE);
    this.maxSize = getValid(parameters.maxSize, DEFAULT_MAX_POINT_SIZE);

    this.classification = DEFAULT_CLASSIFICATION;

    this.defaultAttributeValues.normal = [0, 0, 0];
    this.defaultAttributeValues.classification = [0, 0, 0];
    this.defaultAttributeValues.indices = [0, 0, 0, 0];

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

    if (this.depthMap) {
      this.depthMap.dispose();
      this.depthMap = undefined;
    }
    if (this.backgroundMap) {
      this.backgroundMap.dispose();
      this.backgroundMap = undefined;
    }
  }

  clearVisibleNodeTextureOffsets(): void {
    this.visibleNodeTextureOffsets.clear();
  }

  updateShaderSource(): void {
    this.vertexShader = this.applyDefines(pointCloudShaders.pointcloud.vertex);
    this.fragmentShader = this.applyDefines(pointCloudShaders.pointcloud.fragment);

    if (this.opacity === 1.0) {
      this.blending = NoBlending;
      this.transparent = false;
      this.depthTest = true;
      this.depthWrite = true;
      this.depthFunc = LessEqualDepth;
    } else if (this.opacity < 1.0 && !this.useEDL) {
      this.blending = AdditiveBlending;
      this.transparent = true;
      this.depthTest = false;
      this.depthWrite = true;
    }

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

    define(TREE_TYPE_DEFS[this.treeType]);
    define(SIZE_TYPE_DEFS[this.pointSizeType]);
    define(SHAPE_DEFS[this.shape]);
    define(COLOR_DEFS[this.pointColorType]);
    define(CLIP_MODE_DEFS[this.clipMode]);
    define(OPACITY_DEFS[this.pointOpacityType]);

    // We only perform gamma and brightness/contrast calculations per point if values are specified.
    if (
      this.rgbGamma !== DEFAULT_RGB_GAMMA ||
      this.rgbBrightness !== DEFAULT_RGB_BRIGHTNESS ||
      this.rgbContrast !== DEFAULT_RGB_CONTRAST
    ) {
      define('use_rgb_gamma_contrast_brightness');
    }

    if (this.useFilterByNormal) {
      define('use_filter_by_normal');
    }

    if (this.useEDL) {
      define('use_edl');
    }

    if (this.weighted) {
      define('weighted_splats');
    }

    if (this.hqDepthPass) {
      define('hq_depth_pass');
    }

    if (this.numClipBoxes > 0) {
      define('use_clip_box');
    }

    if (this.highlightPoint) {
      define('highlight_point');
    }

    if (this.useTextureBlending) {
      define('use_texture_blending');
    }

    if (this.usePointCloudMixing) {
      define('use_point_cloud_mixing');
    }

    define('MAX_POINT_LIGHTS 0');
    define('MAX_DIR_LIGHTS 0');
    define(`OBJECT_STYLING_TEXTURE_WIDTH ${OBJECT_STYLING_TEXTURE_WIDTH}`);

    parts.push(shaderSrc);

    return parts.join('\n');
  }

  setPointCloudMixingMode(mode: PointCloudMixingMode): void {
    this.pointCloudMixingMode = mode;
  }

  getPointCloudMixingMode(): PointCloudMixingMode {
    if (this.pointCloudMixingMode === PointCloudMixingMode.STRIPES) {
      return PointCloudMixingMode.STRIPES;
    }

    return PointCloudMixingMode.CHECKBOARD;
  }

  setClipBoxes(clipBoxes: IClipBox[]): void {
    if (!clipBoxes) {
      return;
    }

    this.clipBoxes = clipBoxes;

    const doUpdate = this.numClipBoxes !== clipBoxes.length && (clipBoxes.length === 0 || this.numClipBoxes === 0);

    this.numClipBoxes = clipBoxes.length;
    this.setUniform('clipBoxCount', this.numClipBoxes);

    if (doUpdate) {
      this.updateShaderSource();
    }

    const clipBoxesLength = this.numClipBoxes * 16;
    const clipBoxesArray = new Float32Array(clipBoxesLength);

    for (let i = 0; i < this.numClipBoxes; i++) {
      clipBoxesArray.set(clipBoxes[i].inverse.elements, 16 * i);
    }

    for (let i = 0; i < clipBoxesLength; i++) {
      if (isNaN(clipBoxesArray[i])) {
        clipBoxesArray[i] = Infinity;
      }
    }

    this.setUniform('clipBoxes', clipBoxesArray);
  }

  get objectAppearanceTexture(): PointCloudObjectAppearanceTexture {
    return this._objectAppearanceTexture;
  }

  get classification(): IClassification {
    return this._classification;
  }

  set classification(value: IClassification) {
    const copy = {} as IClassification;
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

    if (uObj.type === 'c') {
      (uObj.value as Color).copy(value as Color);
    } else if (value !== uObj.value) {
      uObj.value = value;
    }
  }

  onBeforeRender(): void {
    this._objectAppearanceTexture.onBeforeRender();
  }

  updateMaterial(
    octreeParams: OctreeMaterialParams,
    visibilityTextureData: Uint8Array,
    camera: Camera,
    renderer: WebGLRenderer
  ): void {
    const pixelRatio = renderer.getPixelRatio();

    if (camera.type === PERSPECTIVE_CAMERA) {
      this.fov = (camera as PerspectiveCamera).fov * (Math.PI / 180);
    } else {
      this.fov = Math.PI / 2; // will result in slope = 1 in the shader
    }
    const renderTarget = renderer.getRenderTarget();
    if (renderTarget !== null) {
      this.screenWidth = renderTarget.width;
      this.screenHeight = renderTarget.height;
    } else {
      this.screenWidth = renderer.domElement.clientWidth * pixelRatio;
      this.screenHeight = renderer.domElement.clientHeight * pixelRatio;
    }

    if (this.useDrawingBufferSize) {
      renderer.getDrawingBufferSize(PointCloudMaterial.helperVec2);
      this.screenWidth = PointCloudMaterial.helperVec2.width;
      this.screenHeight = PointCloudMaterial.helperVec2.height;
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
      texture.image.data.set(textureData);
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

// tslint:disable:no-invalid-this
function uniform<K extends keyof IPointCloudMaterialUniforms>(
  uniformName: K,
  requireSrcUpdate: boolean = false
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol): void => {
    Object.defineProperty(target, propertyKey, {
      get() {
        return this.getUniform(uniformName);
      },
      set(value: any) {
        if (value !== this.getUniform(uniformName)) {
          this.setUniform(uniformName, value);
          if (requireSrcUpdate) {
            this.updateShaderSource();
          }
        }
      }
    });
  };
}

function requiresShaderUpdate(): (target: any, propertyKey: string | symbol) => void {
  return (target: any, propertyKey: string | symbol): void => {
    const fieldName = `_${propertyKey.toString()}`;

    Object.defineProperty(target, propertyKey, {
      get() {
        return this[fieldName];
      },
      set(value: any) {
        if (value !== this[fieldName]) {
          this[fieldName] = value;
          this.updateShaderSource();
        }
      }
    });
  };
}
