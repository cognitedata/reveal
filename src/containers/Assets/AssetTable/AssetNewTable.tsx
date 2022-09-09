import React, { useMemo } from 'react';
import { Button } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Column } from 'react-table';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { getNewColumnsWithRelationshipLabels } from 'utils';
import { RelationshipLabels } from 'types';

const ParentCell = ({
  rootId,
  onRowClick,
}: {
  rootId: number;
  onRowClick: (asset: Asset) => void;
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
      type="link"
      icon="ArrowRight"
      iconPlacement="right"
      style={{ color: 'inherit' }}
      onClick={e => {
        e.stopPropagation();
        if (rootAsset) {
          onRowClick(rootAsset);
        }
      }}
    >
      {isFetched ? rootAsset?.name : 'Loading...'}
    </Button>
  );
};

export type AssetWithRelationshipLabels = RelationshipLabels & Asset;
export interface AssetTableProps
  extends TableProps<AssetWithRelationshipLabels> {
  relatedResourceType?: string;
}

export const AssetTable = (props: AssetTableProps) => {
  const { onRowClick = () => {}, data } = props;

  const columns: Column<AssetWithRelationshipLabels>[] = useMemo(
    () => [
      Table.Columns.name,
      Table.Columns.description,
      Table.Columns.externalId,
      {
        id: 'rootId',
        Header: 'Root Asset',
        accessor: 'rootId',
        Cell: ({ value }) => (
          <ParentCell rootId={value} onRowClick={onRowClick} />
        ),
      },
      Table.Columns.createdTime,
      Table.Columns.labels,
    ],
    [onRowClick]
  );

  const isRelationshipTable = props?.relatedResourceType === 'relationship';

  return (
    <Table<AssetWithRelationshipLabels>
      columns={getNewColumnsWithRelationshipLabels(
        columns,
        isRelationshipTable
      )}
      isColumnSelectEnabled
      hiddenColumns={[
        'parentExternalId',
        'createdTime',
        'description',
        'labels',
      ]}
      data={data || []}
      onRowClick={onRowClick}
    />
  );
};
