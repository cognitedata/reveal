import { useMemo, useState } from 'react';

import { RuleDto } from '@data-quality/api/codegen';
import {
  useAccessControl,
  useLoadDataSource,
  useLoadRules,
} from '@data-quality/hooks';
import { UpsertRuleDrawer } from '@data-quality/pages';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body, Flex, Heading, Table, TableColumn } from '@cognite/cogs.js';

import { LastValidationTime } from '..';

import { RuleOptionsMenu } from './RuleOptionsMenu';
import {
  NameCell,
  ValidityCell,
  SeverityCell,
  ItemsCheckedCell,
  ValidityOverTimeCell,
} from './RulesTableCells';

export const RulesTable = () => {
  const { t } = useTranslation('RulesTable');

  const [editedRule, setEditedRule] = useState<RuleDto | undefined>();

  const { canWriteDataValidation } = useAccessControl();

  const { datapoints, error, loadingDatapoints, loadingRules, rules } =
    useLoadRules();
  const { dataSource } = useLoadDataSource();

  const datapointsDependency = JSON.stringify(datapoints);
  const tableColumns: TableColumn<RuleDto>[] = useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ row }: any) => {
          return (
            <NameCell
              onClick={() => setEditedRule(row.original)}
              ruleName={row.original.name}
            />
          );
        },
      },
      {
        Header: 'Severity',
        accessor: 'severity',
        Cell: ({ row }: any) => {
          return <SeverityCell severity={row.original.severity} />;
        },
      },
      {
        Header: 'Validity',
        Cell: ({ row }: any) => {
          return (
            <ValidityCell
              datapoints={datapoints}
              dataSourceId={dataSource?.externalId}
              loadingDatapoints={loadingDatapoints}
              ruleId={row.original.externalId}
            />
          );
        },
      },
      {
        Header: 'Validity over time',
        Cell: ({ row }: any) => {
          return (
            <ValidityOverTimeCell
              datapoints={datapoints}
              dataSourceId={dataSource?.externalId}
              loadingDatapoints={loadingDatapoints}
              ruleId={row.original.externalId}
            />
          );
        },
      },
      {
        Header: 'Items checked',
        Cell: ({ row }: any) => {
          return (
            <ItemsCheckedCell
              datapoints={datapoints}
              dataSourceId={dataSource?.externalId}
              loadingDatapoints={loadingDatapoints}
              ruleId={row.original.externalId}
            />
          );
        },
      },
      {
        Header: '',
        accessor: 'externalId',
        Cell: ({ row }: any) => {
          return (
            canWriteDataValidation && <RuleOptionsMenu rule={row.original} />
          );
        },
      },
    ];
  }, [datapointsDependency, dataSource?.externalId]);

  const renderContent = () => {
    if (loadingRules) return <Spinner />;

    if (error)
      return (
        <BasicPlaceholder
          type="EmptyStateFolderSad"
          title={t(
            'data_quality_not_found_rules',
            'Something went wrong. The rules could not be loaded.'
          )}
        >
          <Body size="small">{JSON.stringify(error)}</Body>
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
    <>
      <Flex direction="column" gap={22}>
        <Flex direction="row" justifyContent="space-between" gap={10}>
          <Heading level={5}>
            {t('data_quality_all_rules', 'All rules')}
          </Heading>
          <LastValidationTime
            datapoints={datapoints}
            loading={loadingDatapoints}
          />
        </Flex>

        {renderContent()}
      </Flex>

      <UpsertRuleDrawer
        editedRule={editedRule}
        isVisible={!!editedRule}
        onCancel={() => setEditedRule(undefined)}
      />
    </>
  );
};
