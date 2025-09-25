import { PointColorType, PointShape } from '@cognite/reveal';
import {
  Cdf3dImage360CollectionProperties,
  Cdf3dRevisionProperties,
  SceneConfigurationProperties
} from './types';
import { EdgeItem } from '../../data-providers/FdmSDK';

type PropertyValidator = [string, 'string' | 'number'];
type OptionalPropertyValidator = [string, 'string' | 'number' | 'boolean'];

/**
 * Helper function to validate required properties
 */
function validateRequiredProperties(
  props: Record<string, unknown>,
  validators: PropertyValidator[]
): boolean {
  return validators.every(([prop, expectedType]) => typeof props[prop] === expectedType);
}

/**
 * Helper function to validate optional properties (if present, must be correct type)
 */
function validateOptionalProperties(
  props: Record<string, unknown>,
  validators: OptionalPropertyValidator[]
): boolean {
  return validators.every(
    ([prop, expectedType]) => props[prop] === undefined || typeof props[prop] === expectedType
  );
}

export function isSceneConfigurationProperties(
  properties: unknown
): properties is SceneConfigurationProperties {
  if (typeof properties !== 'object' || properties === null) {
    return false;
  }

  const props = properties as Record<string, unknown>;

  // Check required properties
  const requiredProperties: PropertyValidator[] = [
    ['name', 'string'],
    ['cameraTranslationX', 'number'],
    ['cameraTranslationY', 'number'],
    ['cameraTranslationZ', 'number'],
    ['cameraEulerRotationX', 'number'],
    ['cameraEulerRotationY', 'number'],
    ['cameraEulerRotationZ', 'number']
  ];

  if (!validateRequiredProperties(props, requiredProperties)) {
    return false;
  }

  // Check optional properties
  const optionalProperties: OptionalPropertyValidator[] = [
    ['description', 'string'],
    ['cameraTargetX', 'number'],
    ['cameraTargetY', 'number'],
    ['cameraTargetZ', 'number'],
    ['cadBudget', 'number'],
    ['pointCloudBudget', 'number'],
    ['maxRenderResolution', 'number'],
    ['movingCameraResolutionFactor', 'number'],
    ['pointCloudPointSize', 'number']
  ];

  if (!validateOptionalProperties(props, optionalProperties)) {
    return false;
  }

  if (props.pointCloudPointShape !== undefined) {
    const shape = props.pointCloudPointShape as unknown;
    if (typeof shape !== 'string' || !(shape in PointShape)) {
      return false;
    }
  }

  if (props.pointCloudColor !== undefined) {
    const color = props.pointCloudColor as unknown;
    if (typeof color !== 'string' || !(color in PointColorType)) {
      return false;
    }
  }

  return true;
}

export function isSceneModelProperties(properties: unknown): properties is Cdf3dRevisionProperties {
  if (typeof properties !== 'object' || properties === null) {
    return false;
  }

  const props = properties as Record<string, unknown>;

  // Check Transformation3d properties
  if (!isValidTransformation3dProperties(props)) {
    return false;
  }

  // Check required property from SceneModelProperties
  const sceneModelProperties: PropertyValidator[] = [['revisionId', 'number']];

  if (!validateRequiredProperties(props, sceneModelProperties)) {
    return false;
  }

  return hasValidDefaultVisibleProperty(props);
}

export function isScene360CollectionProperties(
  properties: unknown
): properties is Cdf3dImage360CollectionProperties {
  if (typeof properties !== 'object' || properties === null) {
    return false;
  }

  const props = properties as Record<string, unknown>;

  // Check Transformation3d properties
  if (!isValidTransformation3dProperties(props)) {
    return false;
  }

  // Check required properties from Scene360CollectionProperties
  const scene360Properties: PropertyValidator[] = [
    ['image360CollectionExternalId', 'string'],
    ['image360CollectionSpace', 'string']
  ];

  if (!validateRequiredProperties(props, scene360Properties)) {
    return false;
  }

  return hasValidDefaultVisibleProperty(props);
}

function isValidTransformation3dProperties(props: Record<string, unknown>): boolean {
  // Check required properties from Transformation3dProperties
  const transformationProperties: PropertyValidator[] = [
    ['translationX', 'number'],
    ['translationY', 'number'],
    ['translationZ', 'number'],
    ['eulerRotationX', 'number'],
    ['eulerRotationY', 'number'],
    ['eulerRotationZ', 'number'],
    ['scaleX', 'number'],
    ['scaleY', 'number'],
    ['scaleZ', 'number']
  ];

  return validateRequiredProperties(props, transformationProperties);
}

function hasValidDefaultVisibleProperty(props: Record<string, unknown>): boolean {
  return validateOptionalProperties(props, [['defaultVisible', 'boolean']]);
}

export function isScene3dModelEdge(
  model: EdgeItem<{
    scene: { ['RevisionProperties/v1']: Record<string, unknown> };
  }>
): model is EdgeItem<{ scene: { ['RevisionProperties/v1']: Cdf3dRevisionProperties } }> {
  return isSceneModelProperties(model.properties.scene['RevisionProperties/v1']);
}

export function isScene360CollectionEdge(
  model: EdgeItem<{
    scene: { ['Image360CollectionProperties/v1']: Record<string, unknown> };
  }>
): model is EdgeItem<{
  scene: { ['Image360CollectionProperties/v1']: Cdf3dImage360CollectionProperties };
}> {
  return isScene360CollectionProperties(model.properties.scene['Image360CollectionProperties/v1']);
}
