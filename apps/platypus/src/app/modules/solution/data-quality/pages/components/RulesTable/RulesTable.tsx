import { useContext } from 'react';

import { RuleDto, useListAllRules } from '@data-quality/codegen';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body, Flex, Table, TableColumn, Title } from '@cognite/cogs.js';

import DataQualityContext from '../../../context/DataQualityContext';

import { renderNameColumn, renderSeverityColumn } from './helpers';

export const RulesTable = () => {
  const { t } = useTranslation('RulesTable');

  const { dataQualityState } = useContext(DataQualityContext);

  const {
    data: rulesData,
    isLoading: rulesLoading,
    error: rulesError,
  } = useListAllRules({
    pathParams: {
      dataSourceId: dataQualityState.dataSourceId,
    },
  });

  const tableColumns: TableColumn<RuleDto>[] = [
    {
      Header: 'Name',
      accessor: 'name',
      Cell: ({ row }: any) => {
        return renderNameColumn(row.values.name);
      },
    },
    {
      Header: 'Severity',
      accessor: 'severity',
      Cell: ({ row }: any) => {
        return renderSeverityColumn(row.values.severity);
      },
    },
  ];

  const renderContent = () => {
    if (rulesLoading) return <Spinner />;

    if (rulesError)
      return (
        <BasicPlaceholder
          type="EmptyStateFolderSad"
          title={t(
            'data_quality_rules_not_found',
            "Something went wrong. We couldn't load the rules."
          )}
        >
          <Body level={5}>{JSON.stringify(rulesError)}</Body>
        </BasicPlaceholder>
      );

    return (
      <Table<RuleDto>
        columns={tableColumns}
        dataSource={rulesData?.items}
        rowKey={(row) => row.externalId}
      />
    );
  };

  return (
    <Flex direction="column" gap={22}>
      <Title level={5}>{t('data_quality_all_rules', 'All rules')}</Title>
      {renderContent()}
    </Flex>
  );
};
