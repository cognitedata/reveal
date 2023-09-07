import { differenceBy, partition } from 'lodash';

import { CogniteClient } from '@cognite/sdk/dist/src/index';
import { IdsByType } from '@cognite/unified-file-viewer';

import containerConfigToContainerReference from '../containerConfigToContainerReference';
import { EMPTY_FLEXIBLE_LAYOUT } from '../hooks/constants';
import resolveContainerConfig from '../hooks/utils/resolveContainerConfig';
import {
  IndustryCanvasState,
  SerializedIndustryCanvasState,
  SerializedCanvasDocument,
  CanvasDocument,
  isFdmInstanceContainerReference,
  PinnedSensorValueContext,
  FiltersContext,
  SerializedFilter,
} from '../types';

import { isNotUndefined } from './isNotUndefined';

const serializeCanvasContext = (
  state: IndustryCanvasState
): SerializedIndustryCanvasState['context'] => [
  ...Object.keys(state.pinnedTimeseriesIdsByAnnotationId).map(
    (annotationId): PinnedSensorValueContext => ({
      type: 'PINNED_SENSOR_VALUE',
      payload: state.pinnedTimeseriesIdsByAnnotationId[annotationId].map(
        (timeseriesId) => ({
          targetId: annotationId,
          resourceId: timeseriesId.toString(),
          rules: state.liveSensorRulesByAnnotationIdByTimeseriesId ?? [],
          version: 1,
        })
      ),
    })
  ),
  {
    type: 'FILTERS',
    payload: {
      filters: state.filters.map(
        (filter): SerializedFilter => ({
          ...filter,
          appliesWhen: filter.appliesWhen?.map((rule) => ({
            valueAtPath: rule.valueAtPath,
            isEqualTo: rule.isEqualTo === undefined ? null : rule.isEqualTo,
          })),
        })
      ),
    },
  },
];

export const serializeCanvasState = (
  state: IndustryCanvasState
): SerializedIndustryCanvasState => {
  const containerReferences = (state.container.children ?? []).map(
    containerConfigToContainerReference
  );
  const [fdmInstanceContainerReferences, assetCentricContainerReferences] =
    partition(containerReferences, isFdmInstanceContainerReference);
  return {
    canvasAnnotations: state.canvasAnnotations,
    containerReferences: assetCentricContainerReferences,
    fdmInstanceContainerReferences: fdmInstanceContainerReferences,
    context: serializeCanvasContext(state),
  };
};

const deserializePinnedTimeseries = (
  context: SerializedIndustryCanvasState['context']
): IndustryCanvasState['pinnedTimeseriesIdsByAnnotationId'] => {
  return context.reduce((acc, curr) => {
    if (curr.type === 'PINNED_SENSOR_VALUE') {
      curr.payload.forEach((payload) => {
        if (!acc[payload.targetId]) {
          acc[payload.targetId] = [];
        }
        acc[payload.targetId].push(Number(payload.resourceId));
      });
    }
    return acc;
  }, {} as IndustryCanvasState['pinnedTimeseriesIdsByAnnotationId']);
};

const deserializeLiveSensorRules = (
  context: SerializedIndustryCanvasState['context']
): IndustryCanvasState['liveSensorRulesByAnnotationIdByTimeseriesId'] => {
  return context.reduce((acc, curr) => {
    if (curr.type === 'PINNED_SENSOR_VALUE') {
      curr.payload.forEach((payload) => {
        acc = { ...acc, ...payload.rules };
      });
    }
    return acc;
  }, {});
};

const deserializeFilters = (
  context: SerializedIndustryCanvasState['context']
): IndustryCanvasState['filters'] => {
  const filtersContext = context.find((ctx) => ctx.type === 'FILTERS') as
    | FiltersContext
    | undefined;

  if (filtersContext === undefined) {
    return [];
  }

  return (
    filtersContext?.payload.filters.map((filter) => ({
      ...filter,
      appliesWhen: filter.appliesWhen?.map((rule) => ({
        ...rule,
        isEqualTo: rule.isEqualTo === null ? undefined : rule.isEqualTo,
      })),
    })) ?? []
  );
};

export const deserializeCanvasState = async (
  sdk: CogniteClient,
  state: SerializedIndustryCanvasState
): Promise<IndustryCanvasState> => {
  try {
    return {
      canvasAnnotations: state.canvasAnnotations,
      container: {
        ...EMPTY_FLEXIBLE_LAYOUT,
        children: await Promise.all(
          [
            ...state.containerReferences,
            ...state.fdmInstanceContainerReferences,
          ].map((containerReference) =>
            resolveContainerConfig(sdk, containerReference)
          )
        ),
      },
      pinnedTimeseriesIdsByAnnotationId: deserializePinnedTimeseries(
        state.context
      ),
      liveSensorRulesByAnnotationIdByTimeseriesId: deserializeLiveSensorRules(
        state.context
      ),
      filters: deserializeFilters(state.context),
    };
  } catch (error) {
    console.error('Error deserializing canvas container', error);
    return {
      container: EMPTY_FLEXIBLE_LAYOUT,
      canvasAnnotations: [],
      pinnedTimeseriesIdsByAnnotationId: {},
      liveSensorRulesByAnnotationIdByTimeseriesId: {},
      filters: [],
    };
  }
};

export const deserializeCanvasDocument = async (
  sdk: CogniteClient,
  canvasDocument: SerializedCanvasDocument
): Promise<CanvasDocument> => {
  return {
    ...canvasDocument,
    data: await deserializeCanvasState(sdk, canvasDocument.data),
  };
};

const getContainerReferenceIds = (state: SerializedIndustryCanvasState) =>
  [...state.containerReferences, ...state.fdmInstanceContainerReferences].map(
    (ref) => ref.id
  );

export const getRemovedIdsByType = (
  currentState: SerializedIndustryCanvasState,
  prevState: SerializedIndustryCanvasState
): IdsByType => {
  return {
    annotationIds: differenceBy(
      currentState.canvasAnnotations.map((anno) => anno.id),
      prevState.canvasAnnotations.map((anno) => anno.id)
    ),
    containerIds: differenceBy(
      getContainerReferenceIds(currentState),
      getContainerReferenceIds(prevState)
    ).filter(isNotUndefined),
  };
};
