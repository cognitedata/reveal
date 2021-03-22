import React from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { useHistory, useParams } from 'react-router-dom';
import { useFilesAssetAppearsIn } from 'components/FileList';

export const PnidButton = ({ asset }: { asset: Asset }) => {
  const { chartId } = useParams<{ chartId: string }>();
  const history = useHistory();

  const { data: annotations = [], isFetched } = useFilesAssetAppearsIn(asset);

  if (!isFetched || annotations.length === 0) {
    return <></>;
  }

  return (
    <Tooltip content="P&amp;IDs">
      <Button
        variant="ghost"
        icon="SearchDocuments"
        onClick={() => history.push(`${chartId}/files/${asset.id}`)}
      />
    </Tooltip>
  );
};
