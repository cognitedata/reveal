import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import ContextualizeThreeDViewer from '@3d-management/components/ContextualizeThreeDViewer';
import {
  setModelType,
  useContextualizeThreeDViewerStore,
} from '@3d-management/components/ContextualizeThreeDViewer/useContextualizeThreeDViewerStore';

import { useSDK } from '@cognite/sdk-provider';

import { getThreeDRevisionOutputs } from '@data-exploration-lib/domain-layer';

import { ContextualizeEditorHeader } from './ContextualizeEditorHeader';

type ContextualizeEditorParams = {
  modelId: string;
  revisionId: string;
};

export const ContextualizeEditor = () => {
  const params = useParams<ContextualizeEditorParams>();

  if (params.modelId === undefined || params.revisionId === undefined) {
    console.warn(
      'Unable to save annotation to CDF. Model ID or revision ID is undefined.'
    );
    // TODO: Add a proper error page
    return <div>Wrong URL</div>;
  }

  return (
    <>
      <ContextualizeEditorHeader
        modelId={params.modelId}
        revisionId={params.revisionId}
      />
      <ContextualizeThreeDViewer
        modelId={Number(params.modelId)}
        revisionId={Number(params.revisionId)}
      />
    </>
  );
};
