import { PointColorType, PointShape } from '@cognite/reveal';
import {
  type Cdf3dImage360CollectionProperties,
  type Cdf3dRevisionProperties,
  type SceneConfigurationProperties
} from './types';
import { type EdgeItem } from '../../data-providers/FdmSDK';

type ValidatorFunction = (obj: Record<string, unknown>, prop: string) => boolean;

type PropertyValidator = [string, ValidatorFunction];

/**
 * Helper functions to validate properties
 */

function validate(obj: Record<string, unknown>, propertyValidators: PropertyValidator[]): boolean {
  return propertyValidators.every(([prop, validator]) => validator(obj, prop));
}

function validateRequiredNumber(obj: Record<string, unknown>, prop: string): boolean {
  return typeof obj[prop] === 'number';
}

function validateRequiredString(obj: Record<string, unknown>, prop: string): boolean {
  return typeof obj[prop] === 'string';
}

function validateOptionalNumber(obj: Record<string, unknown>, prop: string): boolean {
  return obj[prop] === undefined || typeof obj[prop] === 'number';
}

function validateOptionalString(obj: Record<string, unknown>, prop: string): boolean {
  return obj[prop] === undefined || typeof obj[prop] === 'string';
}

function validateOptionalBoolean(obj: Record<string, unknown>, prop: string): boolean {
  return obj[prop] === undefined || typeof obj[prop] === 'boolean';
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
    ['name', validateRequiredString],
    ['cameraTranslationX', validateRequiredNumber],
    ['cameraTranslationY', validateRequiredNumber],
    ['cameraTranslationZ', validateRequiredNumber],
    ['cameraEulerRotationX', validateRequiredNumber],
    ['cameraEulerRotationY', validateRequiredNumber],
    ['cameraEulerRotationZ', validateRequiredNumber]
  ];

  if (!validate(props, requiredProperties)) {
    return false;
  }

  // Check optional properties
  const optionalProperties: PropertyValidator[] = [
    ['description', validateOptionalString],
    ['cameraTargetX', validateOptionalNumber],
    ['cameraTargetY', validateOptionalNumber],
    ['cameraTargetZ', validateOptionalNumber],
    ['cadBudget', validateOptionalNumber],
    ['pointCloudBudget', validateOptionalNumber],
    ['maxRenderResolution', validateOptionalNumber],
    ['movingCameraResolutionFactor', validateOptionalNumber],
    ['pointCloudPointSize', validateOptionalNumber]
  ];

  if (!validate(props, optionalProperties)) {
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

function isSceneModelProperties(properties: unknown): properties is Cdf3dRevisionProperties {
  if (typeof properties !== 'object' || properties === null) {
    return false;
  }

  const props = properties as Record<string, unknown>;

  // Check Transformation3d properties
  if (!isValidTransformation3dProperties(props)) {
    return false;
  }

  // Check required property from SceneModelProperties
  const sceneModelProperties: PropertyValidator[] = [['revisionId', validateRequiredNumber]];

  if (!validate(props, sceneModelProperties)) {
    return false;
  }

  return hasValidDefaultVisibleProperty(props);
}

function isScene360CollectionProperties(
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
    ['image360CollectionExternalId', validateRequiredString],
    ['image360CollectionSpace', validateRequiredString]
  ];

  if (!validate(props, scene360Properties)) {
    return false;
  }

  return hasValidDefaultVisibleProperty(props);
}

function isValidTransformation3dProperties(props: Record<string, unknown>): boolean {
  // Check required properties from Transformation3dProperties
  const transformationProperties: PropertyValidator[] = [
    ['translationX', validateRequiredNumber],
    ['translationY', validateRequiredNumber],
    ['translationZ', validateRequiredNumber],
    ['eulerRotationX', validateRequiredNumber],
    ['eulerRotationY', validateRequiredNumber],
    ['eulerRotationZ', validateRequiredNumber],
    ['scaleX', validateRequiredNumber],
    ['scaleY', validateRequiredNumber],
    ['scaleZ', validateRequiredNumber]
  ];

  return validate(props, transformationProperties);
}

function hasValidDefaultVisibleProperty(props: Record<string, unknown>): boolean {
  return validateOptionalBoolean(props, 'defaultVisible');
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
