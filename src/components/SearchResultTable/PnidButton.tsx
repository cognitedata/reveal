import React from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { useHistory, useParams } from 'react-router-dom';
import { useFilesAssetAppearsIn } from 'components/FileList';
import { useLinkedAsset } from 'hooks/api';

export const PnidButton = ({
  asset,
  timeseriesId,
  showTooltip = true,
  hideWhenEmpty = true,
}: {
  asset?: Asset;
  timeseriesId?: number;
  showTooltip?: boolean;
  hideWhenEmpty?: boolean;
}) => {
  const { chartId } = useParams<{ chartId: string }>();
  const history = useHistory();

  const shouldFetchLinkedAsset = !asset;

  const { data: linkedAsset, isFetched: isAssetFetched } = useLinkedAsset(
    timeseriesId,
    shouldFetchLinkedAsset
  );

  const { data: files = [], isFetched } = useFilesAssetAppearsIn(
    asset || linkedAsset,
    shouldFetchLinkedAsset ? isAssetFetched : true
  );

  if (!isFetched) {
    return <></>;
  }

  if (files.length === 0) {
    return hideWhenEmpty ? <></> : <span>-</span>;
  }

  return (
    <WithTooltip content={showTooltip ? 'P&IDs' : undefined}>
      <Button
        variant="ghost"
        icon="SearchDocuments"
        onClick={() =>
          history.push({
            pathname: `/${chartId}/files/${
              asset ? asset?.id : linkedAsset?.id
            }`,
            search: history.location.search,
          })
        }
      />
    </WithTooltip>
  );
};

const WithTooltip = ({
  content,
  children,
}: {
  content?: string;
  children: React.ReactElement;
}) => {
  return content ? <Tooltip content={content}>{children}</Tooltip> : children;
};
