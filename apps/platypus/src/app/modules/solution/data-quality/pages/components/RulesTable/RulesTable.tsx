import { RuleDto } from '@data-quality/api/codegen';
import { useLoadDataSource, useLoadRules } from '@data-quality/hooks';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body, Flex, Table, TableColumn, Title } from '@cognite/cogs.js';

import {
  getLastValidationTime,
  renderItemsCheckedCell,
  renderNameCell,
  renderSeverityCell,
  renderValidityCell,
} from './helpers';
import { LastValidationTime } from './LastValidationTime';

export const RulesTable = () => {
  const { t } = useTranslation('RulesTable');

  const { datapoints, error, loadingDatapoints, loadingRules, rules } =
    useLoadRules();
  const { dataSource } = useLoadDataSource();

  const lastValidationTime = getLastValidationTime(datapoints);

  const tableColumns: TableColumn<RuleDto>[] = [
    {
      Header: 'Name',
      accessor: 'name',
      Cell: ({ row }: any) => {
        return renderNameCell(row.original.name);
      },
    },
    {
      Header: 'Severity',
      accessor: 'severity',
      Cell: ({ row }: any) => {
        return renderSeverityCell(row.original.severity);
      },
    },
    {
      Header: 'Validity',
      Cell: ({ row }: any) => {
        return renderValidityCell(
          row.original.externalId,
          datapoints,
          loadingDatapoints,
          dataSource?.externalId
        );
      },
    },
    {
      Header: 'Items checked',
      Cell: ({ row }: any) => {
        return renderItemsCheckedCell(
          row.original.externalId,
          datapoints,
          loadingDatapoints,
          dataSource?.externalId
        );
      },
    },
  ];

  const renderContent = () => {
    if (loadingRules) return <Spinner />;

    if (error)
      return (
        <BasicPlaceholder
          type="EmptyStateFolderSad"
          title={t(
            'data_quality_not_found_rules',
            "Something went wrong. We couldn't load the rules."
          )}
        >
          <Body level={5}>{JSON.stringify(error)}</Body>
        </BasicPlaceholder>
      );

    return (
      <Table<RuleDto>
        columns={tableColumns}
        dataSource={rules}
        rowKey={(row) => row.externalId}
      />
    );
  };

  return (
    <Flex direction="column" gap={22}>
      <Flex direction="row" justifyContent="space-between" gap={10}>
        <Title level={5}>{t('data_quality_all_rules', 'All rules')}</Title>
        <LastValidationTime
          loading={loadingDatapoints}
          validationTime={lastValidationTime}
        />
      </Flex>

      {renderContent()}
    </Flex>
  );
};
