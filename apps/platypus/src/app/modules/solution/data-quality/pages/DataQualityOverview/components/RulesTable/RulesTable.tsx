import { useMemo, useState } from 'react';
import { CellProps } from 'react-table';

import { Body, Flex, Table, TableColumn } from '@cognite/cogs.js';

import { LastValidationTime } from '..';
import { UpsertRuleDrawer } from '../../..';
import { BasicPlaceholder } from '../../../../../../../components/BasicPlaceholder/BasicPlaceholder';
import { Spinner } from '../../../../../../../components/Spinner/Spinner';
import { useTranslation } from '../../../../../../../hooks/useTranslation';
import { RuleDto } from '../../../../api/codegen';
import {
  useAccessControl,
  useLoadDataSource,
  useLoadRules,
} from '../../../../hooks';
import { useLoadLatestRuleRuns } from '../../../../hooks/useLoadLatestRuleRuns';

import { RuleOptionsMenu } from './RuleOptionsMenu';
import {
  NameCell,
  ValidityCell,
  SeverityCell,
  ItemsCheckedCell,
  ValidityOverTimeCell,
  StatusCell,
} from './RulesTableCells';

export const RulesTable = () => {
  const { t } = useTranslation('RulesTable');

  const [editedRule, setEditedRule] = useState<RuleDto | undefined>();

  const { canWriteDataValidation } = useAccessControl();

  const { datapoints, error, loadingDatapoints, loadingRules, rules } =
    useLoadRules();
  const { ruleRuns } = useLoadLatestRuleRuns();
  const { dataSource } = useLoadDataSource();

  const datapointsDependency = JSON.stringify(datapoints);

  const tableColumns: TableColumn<RuleDto>[] = useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ row }: CellProps<RuleDto>) => {
          return (
            <NameCell
              onClick={() => setEditedRule(row.original)}
              ruleName={row.original.name}
            />
          );
        },
      },
      {
        Header: 'Status',
        Cell: ({ row }: CellProps<RuleDto>) => {
          const ruleRun = ruleRuns.find(
            (r) => r.ruleId === row.original.externalId
          );

          if (!ruleRun) return null;

          return (
            <StatusCell message={ruleRun.message} status={ruleRun.status} />
          );
        },
      },
      {
        Header: 'Severity',
        accessor: 'severity',
        Cell: ({ row }: CellProps<RuleDto>) => {
          return <SeverityCell severity={row.original.severity} />;
        },
      },
      {
        Header: 'Validity',
        Cell: ({ row }: CellProps<RuleDto>) => {
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
        Cell: ({ row }: CellProps<RuleDto>) => {
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
        Cell: ({ row }: CellProps<RuleDto>) => {
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
  }, [datapointsDependency, dataSource?.externalId, ruleRuns]);

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
        <Flex direction="row-reverse" justifyContent="space-between" gap={10}>
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
