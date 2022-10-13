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
  WebGLRenderer
} from 'three';
import {
  COLOR_WHITE,
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
  PointSizeType
} from './enums';
import { generateClassificationTexture, generateDataTexture, generateGradientTexture } from './texture-generation';
import { PointClassification, IUniform, OctreeMaterialParams } from './types';
import { SpectralGradient } from './gradients/SpectralGradient';
import { PointCloudObjectAppearanceTexture } from './PointCloudObjectAppearanceTexture';
import { PointCloudObjectIdMaps } from '@reveal/rendering';
import { pointCloudShaders } from '../rendering/shaders';

export interface IPointCloudMaterialParameters {
  size: number;
  minSize: number;
  maxSize: number;
  objectsMaps: PointCloudObjectIdMaps;
}

export interface IPointCloudMaterialUniforms {
  classificationLUT: IUniform<Texture>;
  depthMap: IUniform<Texture | null>;
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
  [PointColorType.Classification]: 'color_type_classification',
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
  visibleNodesTexture: Texture | undefined;
  visibleNodeTextureOffsets = new Map<string, number>();

  private readonly _gradient = SpectralGradient;
  private gradientTexture: Texture | undefined = generateGradientTexture(this._gradient);

  private readonly _objectAppearanceTexture = new PointCloudObjectAppearanceTexture(
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
    opacity: makeUniform('f', 1.0),
    pcIndex: makeUniform('f', 0),
    screenHeight: makeUniform('f', 1.0),
    screenWidth: makeUniform('f', 1.0),
    size: makeUniform('f', 1),
    spacing: makeUniform('f', 1.0),
    // @ts-ignore
    visibleNodes: makeUniform('t', this.visibleNodesTexture || new Texture()),
    vnStart: makeUniform('f', 0.0),
  };

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
  @uniform('screenHeight') screenHeight!: number;
  @uniform('screenWidth') screenWidth!: number;
  @uniform('size') size!: number;
  @uniform('spacing') spacing!: number;

  @requiresShaderUpdate() weighted: boolean = false;
  @requiresShaderUpdate() pointColorType: PointColorType = PointColorType.Rgb;
  @requiresShaderUpdate() pointSizeType: PointSizeType = PointSizeType.Adaptive;
  @requiresShaderUpdate() useEDL: boolean = false;
  @requiresShaderUpdate() shape: PointShape = PointShape.Circle;

  attributes = {
    position: { type: 'fv', value: [] },
    color: { type: 'fv', value: [] },
    intensity: { type: 'f', value: [] },
    classification: { type: 'f', value: [] },
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

    this.size = getValid(parameters.size, 1.0);
    this.minSize = getValid(parameters.minSize, DEFAULT_MIN_POINT_SIZE);
    this.maxSize = getValid(parameters.maxSize, DEFAULT_MAX_POINT_SIZE);

    this.classification = DEFAULT_CLASSIFICATION;

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

    define(SIZE_TYPE_DEFS[this.pointSizeType]);
    define(SHAPE_DEFS[this.shape]);
    define(COLOR_DEFS[this.pointColorType]);

    if (this.useEDL) {
      define('use_edl');
    }

    if (this.weighted) {
      define('weighted_splats');
    }

    define(`OBJECT_STYLING_TEXTURE_WIDTH ${OBJECT_STYLING_TEXTURE_WIDTH}`);

    parts.push(shaderSrc);

    return parts.join('\n');
  }

  get objectAppearanceTexture(): PointCloudObjectAppearanceTexture {
    return this._objectAppearanceTexture;
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
