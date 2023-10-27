import { useEffect, useState } from 'react';

import {
  useFdmAssetMappings,
  useClickedNodeData,
  useReveal,
} from '@cognite/reveal-react-components';

import { InstanceWithPosition } from '../modules/RevealContent';
import {
  getBoundingBoxCenter,
  getCogniteModel,
  getNodesFromModelsMappings,
} from '../utils';

import { useNavigateOnClick } from './useNavigateOnClick';

export function useHandleSelectedInstance(
  externalId: string | undefined,
  space: string | undefined,
  dataType: string | undefined,
  focusInstance: () => void,
  focusNode?: boolean
): InstanceWithPosition | undefined {
  const clickedNodeDataRaw = useClickedNodeData();
  const viewer = useReveal();

  const [selectedInstance, setSelectedInstance] = useState<
    InstanceWithPosition | undefined
  >(undefined);

  const externalIdsList = !(externalId && space) ? [] : [{ externalId, space }];

  useNavigateOnClick(clickedNodeDataRaw);

  const { data: selectedNodeData } = useFdmAssetMappings(
    externalIdsList,
    viewer.models
  );

  useEffect(() => {
    if (focusNode !== true) return;

    focusInstance();
  }, [focusInstance, focusNode]);

  useEffect(() => {
    const nodesData = getNodesFromModelsMappings(externalId, selectedNodeData);

    if (!externalId || !space || !dataType || !nodesData) {
      setSelectedInstance(undefined);
      return;
    }

    const firstSelectedNodeBoundingBox = nodesData.nodes[0].boundingBox;
    const selectedNodeCadModel = getCogniteModel(
      viewer,
      nodesData.modelId,
      nodesData.revisionId
    );

    if (!selectedNodeCadModel || !firstSelectedNodeBoundingBox) {
      setSelectedInstance(undefined);
      return;
    }

    const threeDPosition =
      selectedNodeCadModel.mapPointFromCdfToModelCoordinates(
        getBoundingBoxCenter(firstSelectedNodeBoundingBox)
      );

    setSelectedInstance({
      externalId,
      instanceSpace: space,
      dataType,
      threeDPosition: threeDPosition,
    });
  }, [externalId, space, dataType, selectedNodeData]);

  return selectedInstance;
}
