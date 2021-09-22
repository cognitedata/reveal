import React from 'react';
import { Button } from '@cognite/cogs.js';
import { ResourceItem } from '@cognite/data-exploration';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { useReviewFiles } from 'hooks';

type Props = {
  id: ResourceItem['id'];
  setEditMode: (val: boolean) => void;
};
export const ClearTagsButton = (props: Props) => {
  const { id, setEditMode } = props;
  const { onClearTags } = useReviewFiles([id]);

  const onDeleteClick = () => {
    trackUsage(PNID_METRICS.fileViewer.deleteAnnotations, {
      fileId: id,
    });
    onClearTags([id]);
    setEditMode(false);
  };

  return (
    <Button
      aria-label="Button-Clear-Tags"
      icon="Trash"
      key={id}
      onClick={onDeleteClick}
    />
  );
};
