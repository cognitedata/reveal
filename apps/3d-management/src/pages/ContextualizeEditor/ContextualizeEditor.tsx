import { useParams } from 'react-router-dom';

import { Flex } from '@cognite/cogs.js';

import ContextualizeThreeDViewer from '../../components/ContextualizeThreeDViewer';

import { CONTEXTUALIZE_EDITOR_HEADER_HEIGHT } from './constants';

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
      {/* 
        TODO: Add a proper header
        Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2157
       */}
      <Flex
        dir="horizontal"
        justifyContent="space-between"
        style={{
          height: `${CONTEXTUALIZE_EDITOR_HEADER_HEIGHT}px`,
          borderBottom: '1px solid #ccc',
          boxSizing: 'border-box',
          padding: '0 20px',
        }}
      >
        <h1>Contextualize Editor</h1>
        <div>
          <p
            style={{
              marginBottom: 0,
            }}
          >
            <b>Model ID:</b> {params.modelId}
          </p>
          <p>
            <b>Revision ID:</b> {params.revisionId}
          </p>
        </div>
      </Flex>

      <ContextualizeThreeDViewer
        modelId={Number(params.modelId)}
        revisionId={Number(params.revisionId)}
      />
    </>
  );
};
