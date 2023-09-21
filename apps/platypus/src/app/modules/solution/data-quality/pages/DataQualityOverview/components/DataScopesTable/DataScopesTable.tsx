import { CellProps } from 'react-table';

import { DataScopeDto } from '@data-quality/api/codegen';
import { useLoadDataScopes } from '@data-quality/hooks';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body, Flex, Table, TableColumn } from '@cognite/cogs.js';

import { DataTypeCell, FiltersCell, NameCell } from './DataScopesCells';

export const DataScopesTable = () => {
  const { t } = useTranslation('DataScopesTable');

  const { dataScopes, isLoading, error } = useLoadDataScopes();

  const tableColumns: TableColumn<DataScopeDto>[] = [
    {
      Header: 'Name',
      accessor: 'name',
      Cell: ({ row }: CellProps<DataScopeDto>) => {
        return (
          <NameCell
            onClick={() => {
              Notification({
                type: 'info',
                message: 'Under development',
              });
            }}
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
  ];

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

      {/*TODO add here modal for upserting a data scope */}
    </>
  );
};
