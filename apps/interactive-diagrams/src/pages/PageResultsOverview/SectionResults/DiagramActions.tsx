import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Tooltip } from 'antd';

import { Button } from '@cognite/cogs.js';

import { Dropdown } from '../../../components/Common';
import { MenuAll } from '../../../containers';
import {
  useReviewFiles,
  useActiveWorkflow,
  isFilePending,
} from '../../../hooks';
import {
  useWorkflowDiagramsIds,
  useWorkflowItems,
} from '../../../modules/workflows';
import { diagramPreview } from '../../../routes/paths';
import { getUrlWithQueryParams } from '../../../utils/config';

import { InfoWrapper } from './components';

export default function DiagramActions() {
  const navigate = useNavigate();
  const { workflowId } = useActiveWorkflow();
  const diagramsIds = useWorkflowDiagramsIds(workflowId, true, true);
  const { diagrams } = useWorkflowItems(Number(workflowId), true);
  const { onApproveDiagrams, isOnApprovedLoading: isLoading } =
    useReviewFiles(diagramsIds);

  const noSuccessfulFiles = !diagramsIds?.length;

  const onPreviewAllClick = () => {
    if (!noSuccessfulFiles)
      navigate(
        getUrlWithQueryParams(diagramPreview.path(workflowId, diagramsIds[0]))
      );
  };

  const isApproveAllDisabled =
    isLoading || !diagrams.some((diagram) => isFilePending(diagram));

  return (
    <InfoWrapper>
      <Tooltip
        title={
          isApproveAllDisabled &&
          'All diagrams are already approved or have no tags to review'
        }
      >
        <Button
          aria-label="Button-Approve-All"
          icon="Checkmark"
          type="tertiary"
          disabled={isApproveAllDisabled || noSuccessfulFiles}
          onClick={() => onApproveDiagrams(true)}
        >
          Approve all
        </Button>
      </Tooltip>
      <Button
        aria-label="Button-Preview-All"
        icon="EyeShow"
        type="primary"
        onClick={onPreviewAllClick}
        disabled={isLoading || noSuccessfulFiles}
      >
        Preview all
      </Button>
      <Dropdown content={<MenuAll canRejectAll={!isApproveAllDisabled} />} />
    </InfoWrapper>
  );
}
