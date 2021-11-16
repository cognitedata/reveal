import { Loader, Table } from '@cognite/cogs.js';
import { Classifier } from '@cognite/sdk-playground';
import { Empty } from 'components/states/Empty';
import { homeConfig } from 'configs/global.config';
import React from 'react';
import { useDocumentsClassifiersQuery } from 'services/query/documents/query';
import { sortByDate } from 'utils/sort';
import { ClassifierActions, curateColumns } from './curateClassifierColumns';

interface Props {
  classifier?: Classifier;
  classifierActionsCallback?: ClassifierActions;
}
export const ClassifierTable: React.FC<Props> = ({
  classifier,
  classifierActionsCallback,
}) => {
  const { data, isLoading } = useDocumentsClassifiersQuery();

  const columns = React.useMemo(
    () => curateColumns(classifierActionsCallback),
    [classifierActionsCallback]
  );

  if (isLoading) {
    return <Loader darkMode />;
  }

  return (
    <Table<Classifier>
      pagination={false}
      dataSource={classifier ? [classifier] : sortByDate(data)}
      columns={columns as any}
      locale={{
        emptyText: (
          <Empty
            title={homeConfig.EMPTY_TABLE_TITLE}
            description={homeConfig.EMPTY_TABLE_DESCRIPTION}
          />
        ),
      }}
    />
  );
};
