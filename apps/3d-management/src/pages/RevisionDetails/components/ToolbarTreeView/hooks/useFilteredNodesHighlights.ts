import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store';
import React, { useEffect } from 'react';
import { v3Client } from '@cognite/cdf-sdk-singleton';
import {
  PropertyFilterNodeCollection,
  Cognite3DModel,
  NodeOutlineColor,
} from '@cognite/reveal';
import {
  setNodeFilterLoadingState,
  setNodePropertyFilter,
} from 'src/store/modules/toolbar/toolbarActions';
import { assignOrUpdateStyledNodeCollection } from 'src/utils/sdk/3dNodeStylingUtils';

export function useFilteredNodesHighlights({
  model,
}: {
  model: Cognite3DModel;
}) {
  const dispatch = useDispatch();
  const { value: filter } = useSelector(
    ({ toolbar }: RootState) => toolbar.nodePropertyFilter
  );

  const filteredNodes = React.useRef<PropertyFilterNodeCollection>(
    new PropertyFilterNodeCollection(v3Client as any, model, {
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
      model.unassignStyledNodeCollection(filteredNodesSet);
      if (filteredNodesSet) {
        filteredNodesSet.clear();
      }
      dispatch(setNodePropertyFilter(null));
    };
  }, [dispatch, model]);

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
