import { useMemo } from 'react';

import {
  isAnnotation,
  isContainerConfig,
  ContainerType,
} from '@cognite/unified-file-viewer';

import { setInteractionState } from '../state/useIndustrialCanvasStore';
import {
  CanvasNode,
  Filter,
  IndustryCanvasContainerConfig,
  IndustryCanvasState,
} from '../types';
import assertNever from '../utils/assertNever';

import findApplicableContainerConfigFilter from './utils/findApplicableContainerConfigFilter';

const applyProperties = (
  containerConfig: IndustryCanvasContainerConfig,
  filters: Filter[]
) => {
  if (
    containerConfig.type === ContainerType.ASSET ||
    containerConfig.type === ContainerType.EVENT
  ) {
    const filter = findApplicableContainerConfigFilter(
      containerConfig,
      filters
    );

    if (filter === undefined) {
      return containerConfig;
    }

    return {
      ...containerConfig,
      properties: filter.properties,
    };
  }

  return containerConfig;
};

const useNodes = (canvasState: IndustryCanvasState): CanvasNode[] =>
  useMemo(
    () =>
      canvasState.nodes.map((node) => {
        if (isContainerConfig(node)) {
          return applyProperties(
            {
              ...node,
              onClick: (e) => {
                e.cancelBubble = true;
                setInteractionState({
                  hoverId: undefined,
                  clickedContainerAnnotationId: undefined,
                });
              },
            },
            canvasState.filters
          );
        }
        if (isAnnotation(node)) {
          return {
            ...node,
            onClick: (e, annotation) => {
              e.cancelBubble = true;
              setInteractionState({
                hoverId: undefined,
                clickedContainerAnnotationId: annotation.id,
              });
            },
          };
        }
        assertNever(node, `Unsupported node '${node}' provided`);
      }),
    [canvasState.nodes, canvasState.filters]
  );

export default useNodes;
