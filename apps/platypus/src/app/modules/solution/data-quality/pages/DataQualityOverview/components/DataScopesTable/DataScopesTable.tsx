import { useMemo, useState } from 'react';
import { CellProps } from 'react-table';

import { Body, Flex, Table, TableColumn } from '@cognite/cogs.js';

import { UpsertDataScopeModal } from '../../..';
import { BasicPlaceholder } from '../../../../../../../components/BasicPlaceholder/BasicPlaceholder';
import { Spinner } from '../../../../../../../components/Spinner/Spinner';
import { useTranslation } from '../../../../../../../hooks/useTranslation';
import { DataScopeDto } from '../../../../api/codegen';
import {
  useAccessControl,
  useLoadDataScopes,
  useLoadDataSource,
} from '../../../../hooks';

import { DataScopeOptionsMenu } from './DataScopeOptionsMenu';
import { DataTypeCell, FiltersCell, NameCell } from './DataScopesCells';

export const DataScopesTable = () => {
  const { t } = useTranslation('DataScopesTable');

  const [editedDataScope, setEditedDataScope] = useState<DataScopeDto>();

  const { canWriteDataValidation } = useAccessControl();
  const { dataScopes, isLoading, error } = useLoadDataScopes();
  const { dataSource } = useLoadDataSource();

  const dataScopesDependency = JSON.stringify(dataScopes);

  const tableColumns: TableColumn<DataScopeDto>[] = useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ row }: CellProps<DataScopeDto>) => {
          return (
            <NameCell
              onClick={() => setEditedDataScope(row.original)}
              dataScopeName={row.original.name}
            />
          );
        },
      },
      {
        Header: 'Data type',
        accessor: 'dataType',
        Cell: ({ row }: CellProps<DataScopeDto>) => {
          return <DataTypeCell dataType={row.original.dataType} />;
        },
      },
      {
        Header: 'Filters',
        accessor: 'filters',
        Cell: ({ row }: CellProps<DataScopeDto>) => {
          return <FiltersCell filters={row.original.filters} />;
        },
      },
      {
        Header: '',
        accessor: 'externalId',
        Cell: ({ row }: any) => {
          return (
            canWriteDataValidation && (
              <DataScopeOptionsMenu dataScope={row.original} />
            )
          );
        },
      },
    ];
  }, [dataSource?.externalId, dataScopesDependency]);

  const renderContent = () => {
    if (isLoading) return <Spinner />;

    if (error)
      return (
        <BasicPlaceholder
          type="EmptyStateFolderSad"
          title={t(
            'data_quality_not_found_data_scopes',
            'Something went wrong. The data scopes could not be loaded.'
          )}
        >
          <Body size="small">{JSON.stringify(error)}</Body>
        </BasicPlaceholder>
      );

    return (
      <Table<DataScopeDto>
        columns={tableColumns}
        dataSource={dataScopes}
        rowKey={(row) => row.externalId}
      />
    );
  };

  return (
    <>
      <Flex direction="column" gap={22}>
        <Flex direction="row" justifyContent="space-between" gap={10}>
          {/* TODO add here search bar */}
        </Flex>

        {renderContent()}
      </Flex>

      <UpsertDataScopeModal
        editedDataScope={editedDataScope}
        isVisible={!!editedDataScope}
        onCancel={() => setEditedDataScope(undefined)}
      />
    </>
  );
};
