import React from 'react';
import { Button } from '@cognite/cogs.js';
// import { useActiveWorkflow } from 'hooks';
import { InfoWrapper } from './components';

export default function DiagramActions() {
  // const { workflowId } = useActiveWorkflow();

  const onApproveAllClick = () => {};
  const onPreviewAllClick = () => {};
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
