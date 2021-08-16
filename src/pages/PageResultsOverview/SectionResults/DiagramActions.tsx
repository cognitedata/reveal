import React from 'react';
import { Button } from '@cognite/cogs.js';
import { useReviewFiles } from 'hooks';
import { useWorkflowItems } from 'modules/workflows';
import { useParams, useHistory } from 'react-router-dom';
import { diagramPreview } from 'routes/paths';
import { InfoWrapper } from './components';

export default function DiagramActions() {
  const history = useHistory();
  const { tenant, workflowId } =
    useParams<{ tenant: string; workflowId: string }>();

  const { diagrams } = useWorkflowItems(Number(workflowId), true);

  const { onApproved } = useReviewFiles(
    diagrams.map((diagram) => Number(diagram.id))
  );

  const onApproveAllClick = () => {
    onApproved(diagrams.map((diagram) => Number(diagram.id)));
  };
  const onPreviewAllClick = () => {
    history.push(diagramPreview.path(tenant, workflowId, diagrams[0].id));
  };
  const onMoreClick = () => {};

  return (
    <InfoWrapper>
      <Button icon="Checkmark" type="tertiary" onClick={onApproveAllClick}>
        Approve all
      </Button>
      <Button icon="ExpandMax" type="primary" onClick={onPreviewAllClick}>
        Preview all
      </Button>
      <Button
        icon="MoreOverflowEllipsisHorizontal"
        variant="ghost"
        onClick={onMoreClick}
      />
    </InfoWrapper>
  );
}
