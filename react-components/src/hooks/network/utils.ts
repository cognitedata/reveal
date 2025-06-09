import { type Model3D, type TableExpressionEqualsFilterV3 } from '@cognite/sdk';
import { getModelType } from './getModelType';
import { type LatestRevisionInfoResponse, type ModelWithRevisionInfo } from './types';

export function getNodeExternalIdEqualsFilter<T extends string>(
  externalId: T
): TableExpressionEqualsFilterV3 {
  return {
    equals: {
      property: ['node', 'externalId'],
      value: externalId
    }
  } as const satisfies TableExpressionEqualsFilterV3;
}

export function getNodeSpaceEqualsFilter<T extends string>(
  space: T
): TableExpressionEqualsFilterV3 {
  return {
    equals: {
      property: ['node', 'space'],
      value: space
    }
  } as const satisfies TableExpressionEqualsFilterV3;
}

export function mapModelsToRevisionInfo(
  models: Array<Model3D & LatestRevisionInfoResponse>
): ModelWithRevisionInfo[] {
  return models.map((model) => {
    const lastRevisionInfo = model.lastRevisionInfo;
    if (lastRevisionInfo === undefined) {
      return {
        id: model.id,
        sourceType: 'classic',
        resourceType: 'unknown',
        displayName: model.name,
        createdTime: new Date(model.createdTime),
        lastUpdatedTime: new Date(model.createdTime),
        revisionCount: 0
      } satisfies ModelWithRevisionInfo;
    }
    const type = getModelType(lastRevisionInfo.types ?? []);
    return {
      id: model.id,
      sourceType: 'classic',
      resourceType: type,
      displayName: model.name,
      createdTime: new Date(model.createdTime),
      lastUpdatedTime: new Date(lastRevisionInfo.createdTime),
      revisionCount: lastRevisionInfo.revisionCount,
      latestRevisionInfo: {
        sourceType: 'classic',
        id: lastRevisionInfo.revisionId,
        createdTime: new Date(lastRevisionInfo.createdTime)
      }
    } satisfies ModelWithRevisionInfo;
  });
}
