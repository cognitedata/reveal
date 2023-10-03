import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  PropertyFilterNodeCollection,
  CogniteCadModel,
  NodeOutlineColor,
  Cognite3DViewer,
} from '@cognite/reveal';
import { useSDK } from '@cognite/sdk-provider';

import { RootState } from '../../../../../store';
import {
  setNodeFilterLoadingState,
  setNodePropertyFilter,
} from '../../../../../store/modules/toolbar/toolbarActions';
import { assignOrUpdateStyledNodeCollection } from '../../../../../utils/sdk/3dNodeStylingUtils';

export function useFilteredNodesHighlights({
  model,
  viewer,
}: {
  model: CogniteCadModel;
  viewer: Cognite3DViewer;
}) {
  const dispatch = useDispatch();
  const { value: filter } = useSelector(
    ({ toolbar }: RootState) => toolbar.nodePropertyFilter
  );
  const sdk = useSDK();

  const filteredNodes = React.useRef<PropertyFilterNodeCollection>(
    new PropertyFilterNodeCollection(sdk, model, {
      requestPartitions: 10,
    })
  );

  // bind filteredNodes to model
  useEffect(() => {
    const filteredNodesSet = filteredNodes.current;
    assignOrUpdateStyledNodeCollection(model, filteredNodesSet, {
      outlineColor: NodeOutlineColor.Cyan,
      renderInFront: true,
      renderGhosted: false,
    });
    return () => {
      if (viewer.models.includes(model)) {
        model.unassignStyledNodeCollection(filteredNodesSet);
      }
      if (filteredNodesSet) {
        filteredNodesSet.clear();
      }
      dispatch(setNodePropertyFilter(null));
    };
  }, [dispatch, model, viewer]);

  // filter execution and loading state updates
  useEffect(() => {
    if (!filter) {
      filteredNodes.current.clear();
    } else {
      dispatch(setNodeFilterLoadingState(true));

      const currentFilter = filter;
      filteredNodes.current.executeFilter(filter).finally(() => {
        if (currentFilter === filter) {
          dispatch(setNodeFilterLoadingState(false));
        }
      });
    }

    return () => {
      dispatch(setNodeFilterLoadingState(false));
    };
  }, [dispatch, filter]);
}
