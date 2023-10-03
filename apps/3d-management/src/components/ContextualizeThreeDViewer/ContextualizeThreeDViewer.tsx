import { useEffect } from 'react';

import styled from 'styled-components';

import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';
import {
  QueryFunctionContext,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { RevealContainer } from '@cognite/reveal-react-components';
import { CogniteClient } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { getThreeDRevisionOutputs } from '@data-exploration-lib/domain-layer';

import { CadContextualizeThreeDViewer } from './components/Cad/CadContextualizeThreeDViewer';
import { PointCloudContextualizeThreeDViewer } from './components/PointCloud/PointCloudContextualizeThreeDViewer';
import { useSyncStateWithViewer } from './hooks/useSyncStateWithViewer';
import {
  useContextualizeThreeDViewerStore,
  setModelType,
} from './useContextualizeThreeDViewerStore';

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const ContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();

  const { modelType } = useContextualizeThreeDViewerStore((state) => ({
    modelType: state.modelType,
  }));

  useEffect(() => {
    (async () => {
      // call the sdk.get() to retrieve the outputs and check the model type with the url:
      // '/api/v1/projects/${getProject()}/3d/models/${modelId}/revisions/${revisionId}/outputs?format=all-outputs'
      const response = await getThreeDRevisionOutputs(
        sdk,
        modelId,
        revisionId,
        'all-outputs'
      );
      if (response.find((item) => item.format === 'ept-pointcloud')) {
        setModelType('pointcloud');
      } else {
        setModelType('cad');
      }
    })();
  }, [sdk, modelId, revisionId]);

  useSyncStateWithViewer();

  return (
    <>
      {modelType === 'cad' && (
        <CadContextualizeThreeDViewer
          modelId={Number(modelId)}
          revisionId={Number(revisionId)}
        />
      )}
      {modelType === 'pointcloud' && (
        <PointCloudContextualizeThreeDViewer
          modelId={Number(modelId)}
          revisionId={Number(revisionId)}
        />
      )}
    </>
  );
};
