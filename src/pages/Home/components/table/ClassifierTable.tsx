import { Loader, Table } from '@cognite/cogs.js';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { Empty } from 'components/states/Empty';
import { homeConfig } from 'configs/global.config';
import React from 'react';
import { useDocumentsClassifiersQuery } from 'services/query/classifier/query';
import { sortByDate } from 'utils/sort';
import { ClassifierActions, curateColumns } from './curateClassifierColumns';

interface Props {
  classifierActionsCallback?: ClassifierActions;
}

export const ClassifierTable: React.FC<Props> = ({
  classifierActionsCallback,
}) => {
  const { data: classifiers, isLoading } = useDocumentsClassifiersQuery();

  const columns = React.useMemo(
    () => curateColumns(classifierActionsCallback),
    [classifierActionsCallback]
  );

  const data = React.useMemo(() => {
    const nonActiveClassifiers = classifiers.filter((item) => !item.active);
    return sortByDate(nonActiveClassifiers);
  }, [classifiers]);

  if (isLoading) {
    return <Loader darkMode />;
  }

  return (
    <Table<Classifier>
      pagination={false}
      dataSource={data}
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
