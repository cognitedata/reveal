import React from 'react';
import { useNavigate } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { useRevisions } from '../../../../hooks/revisions';

const ThreeDContextualizeButton = ({ record }) => {
  const navigate = useNavigate();
  const revisionsQuery = useRevisions(record.id);
  const isRevisionProcessing =
    revisionsQuery.data &&
    revisionsQuery.data[0]?.status.toLowerCase() !== 'done';
  const { isEnabled: contextualizeEditorFeatureFlagIsEnabled } = useFlag(
    '3D_MANAGEMENT_contextualize_editor'
  );

  if (!contextualizeEditorFeatureFlagIsEnabled) {
    return null;
  }

  const handleClick = () => {
    const revisionId = revisionsQuery?.data?.[0]?.id;
    if (revisionId) {
      navigate(
        createLink(
          `/3d-models/contextualize-editor/${record.id}/revisions/${revisionId}`
        )
      );
    }
  };

  return (
    <Button
      className={`right-button ${
        isRevisionProcessing ? 'disabled-button' : ''
      }`}
      type="primary"
      onClick={handleClick}
      disabled={isRevisionProcessing}
      title={
        isRevisionProcessing
          ? 'The latest revision failed or is processing'
          : ''
      }
    >
      Contextualize
    </Button>
  );
};
export default ThreeDContextualizeButton;
