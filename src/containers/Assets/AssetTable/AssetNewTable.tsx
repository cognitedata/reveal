import React, { useMemo } from 'react';
import { Asset } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import { Column } from 'react-table';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { RelationshipLabels } from 'types';

export type AssetWithRelationshipLabels = RelationshipLabels & Asset;

import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { StyledButton } from 'components/ReactTable';

export const ParentCell = ({
  rootId,
  onClick,
}: {
  rootId: number;
  onClick: (asset: Asset) => void;
}) => {
  const { data: rootAsset, isLoading } = useCdfItem<Asset>(
    'assets',
    { id: rootId },
    {
      enabled: Boolean(rootId),
    }
  );

  return (
    <Button
      type="link"
      iconPlacement="right"
      icon="ArrowRight"
      onClick={e => {
        e.stopPropagation();
        if (rootAsset) {
          onClick(rootAsset);
        }
      }}
    >
      {isLoading ? (
        'Loading...'
      ) : (
        <StyledButton>{rootAsset?.name}</StyledButton>
      )}
    </Button>
  );
};

export const AssetNewTable = (
  props: TableProps<AssetWithRelationshipLabels>
) => {
  const { onRowClick = () => {}, data, ...rest } = props;

  const columns = useMemo(
    () => [
      Table.Columns.name,
      Table.Columns.description,
      Table.Columns.externalId,
      {
        ...Table.Columns.rootAsset,
        Cell: ({ value }: { value: number }) => (
          <ParentCell rootId={value!} onClick={onRowClick} />
        ),
      },
      Table.Columns.created,
      Table.Columns.labels,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ) as Column<Asset>[];

  return (
    <Table<Asset>
      columns={columns}
      visibleColumns={['name', 'rootId']}
      data={data || []}
      onRowClick={onRowClick}
      {...rest}
    />
  );
};
