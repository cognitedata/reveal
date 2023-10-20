import { useNavigate } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Tooltip } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';
import { Revision3D } from '@cognite/sdk';

import { useRevisions } from '../../../../hooks/revisions';

const getTooltipContent = (
  revisions: Revision3D[] | undefined
): { isDisabled: boolean; tooltipContent: string | undefined } => {
  if (revisions === undefined || revisions.length === 0) {
    return {
      isDisabled: true,
      tooltipContent: "The model doesn't have any revisions",
    };
  }

  if (revisions[0].status === 'Failed') {
    return {
      isDisabled: true,
      tooltipContent: 'The latest revision failed',
    };
  }

  if (revisions[0].status !== 'Done') {
    return {
      isDisabled: true,
      tooltipContent: 'The latest revision is still processing',
    };
  }

  return {
    isDisabled: false,
    tooltipContent: undefined,
  };
};

const ThreeDContextualizeButton = ({ record }) => {
  const navigate = useNavigate();
  const { data: revisions } = useRevisions(record.id);
  const { isEnabled: contextualizeEditorFeatureFlagIsEnabled } = useFlag(
    '3D_MANAGEMENT_contextualize_editor'
  );

  if (!contextualizeEditorFeatureFlagIsEnabled) {
    return null;
  }

  const handleClick = () => {
    const revisionId = revisions?.[0]?.id;
    if (revisionId === undefined) return;

    navigate(
      createLink(
        `/3d-models/contextualize-editor/${record.id}/revisions/${revisionId}`
      )
    );
  };

  const { isDisabled, tooltipContent } = getTooltipContent(revisions);

  if (isDisabled) {
    return (
      <Tooltip content={tooltipContent}>
        <Button className="right-button" type="secondary" disabled={isDisabled}>
          Contextualize
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button className="right-button" type="secondary" onClick={handleClick}>
      Contextualize
    </Button>
  );
};
export default ThreeDContextualizeButton;
