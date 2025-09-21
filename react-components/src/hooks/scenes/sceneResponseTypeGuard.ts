import { PointColorType, PointShape } from '@cognite/reveal';
import { type SceneConfigurationProperties } from './types';

type PropertyValidator = [string, 'string' | 'number'];
type OptionalPropertyValidator = [string, 'string' | 'number'];

function validateRequiredProperties(
  props: Record<string, unknown>,
  validators: PropertyValidator[]
): boolean {
  return validators.every(([prop, expectedType]) => {
    const valueType = typeof props[prop];
    return (expectedType === 'string' || expectedType === 'number') && valueType === expectedType;
  });
}

function validateOptionalProperties(
  props: Record<string, unknown>,
  validators: OptionalPropertyValidator[]
): boolean {
  return validators.every(([prop, expectedType]) => {
    const value = props[prop];
    const valueType = typeof value;
    return (
      value === undefined ||
      ((expectedType === 'string' || expectedType === 'number') && valueType === expectedType)
    );
  });
}

export function isSceneConfigurationProperties(
  properties: unknown
): properties is SceneConfigurationProperties {
  if (typeof properties !== 'object' || properties === null) {
    return false;
  }

  const props = properties as Record<string, unknown>;

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
