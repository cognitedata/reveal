import { createLink } from '@cognite/cdf-utilities';
import { Collapse, Title } from '@cognite/cogs.js';
import { ResourceType } from '@data-exploration-lib/core';

import {
  InternalDocument,
  useAssetsByIdQuery,
  useDocumentSearchResultQuery,
} from '@data-exploration-lib/domain-layer';
import { ResourceDetailsTemplate, Table } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { AssetInfo } from '../../Info';

interface Props {
  assetId: number;
  isSelected: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
}
export const AssetDetails: FC<Props> = ({
  assetId,
  isSelected,
  onSelectClicked,
  onClose,
}) => {
  const { data } = useAssetsByIdQuery([{ id: assetId }]);
  const asset = useMemo(() => {
    return data ? data[0] : undefined;
  }, [data]);

  const onOpenResources = (resourceType: ResourceType, id: number) => {
    const link = createLink(`/explore/search/${resourceType}/${id}`);
    window.open(link, '_blank');
  };
  const columns = useMemo(
    () => [Table.Columns.name()],
    []
  ) as ColumnDef<InternalDocument>[];
  const {
    results: relatedFiles = [],
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useDocumentSearchResultQuery({
    filter: { assetSubtreeIds: [{ value: assetId }] },
    limit: 10,
  });

  return (
    <ResourceDetailsTemplate
      title={asset ? asset.name : ''}
      icon="Assets"
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelectClicked}
    >
      <Collapse accordion ghost defaultActiveKey="details">
        <Collapse.Panel key="details" header={<h4>Details</h4>}>
          {asset ? (
            <AssetInfo asset={asset} />
          ) : (
            <Title level={5}>No Details Available</Title>
          )}
        </Collapse.Panel>
        <Collapse.Panel header={<h4>Files</h4>}>
          <Wrapper>
            <Table<InternalDocument>
              data={relatedFiles}
              columns={columns}
              hasNextPage={hasNextPage}
              showLoadButton
              fetchMore={fetchNextPage}
              isLoadingMore={isLoading}
              onRowClick={(file) => onOpenResources('file', file.id)}
              id="related-file-asset-details"
              enableSelection
              hideColumnToggle
            />
          </Wrapper>
        </Collapse.Panel>
      </Collapse>
    </ResourceDetailsTemplate>
  );
};

const Wrapper = styled.div`
  max-height: 240px;
  overflow: auto;
`;
