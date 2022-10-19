import React, { useMemo } from 'react';
import { Asset } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import { Column } from 'react-table';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { getNewColumnsWithRelationshipLabels } from 'utils';
import { RelationshipLabels } from 'types';

export type AssetWithRelationshipLabels = RelationshipLabels & Asset;
export interface AssetTableProps
  extends Omit<TableProps<AssetWithRelationshipLabels>, 'columns'> {
  relatedResourceType?: string;
}

import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { StyledButton } from 'components/ReactTable';

export const ParentCell = ({
  rootId,
  onClick,
}: {
  rootId: number;
  onClick: (asset: Asset) => void;
}) => {
  const { data: rootAsset, isFetched } = useCdfItem<Asset>(
    'assets',
    { id: rootId },
    {
      enabled: Boolean(rootId),
    }
  );

  return (
    <Button
      type="ghost"
      iconPlacement="right"
      icon="ArrowRight"
      onClick={e => {
        e.stopPropagation();
        if (rootAsset) {
          onClick(rootAsset);
        }
      }}
    >
      {isFetched ? <StyledButton>rootAsset?.name</StyledButton> : 'Loading...'}
    </Button>
  );
};

export const AssetNewTable = (props: AssetTableProps) => {
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
    [onRowClick]
  ) as Column<AssetWithRelationshipLabels>[];

  const isRelationshipTable = props?.relatedResourceType === 'relationship';

  return (
    <Table<AssetWithRelationshipLabels>
      columns={getNewColumnsWithRelationshipLabels<AssetWithRelationshipLabels>(
        columns,
        isRelationshipTable
      )}
      visibleColumns={['name', 'rootId']}
      data={data || []}
      onRowClick={onRowClick}
      {...rest}
    />
  );
};
