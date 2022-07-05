import { Button, Flex, Loader, Table } from '@cognite/cogs.js';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { Empty } from 'src/components/states/Empty';
import { homeConfig } from 'src/configs/global.config';
import React from 'react';
import { useDocumentsClassifiersQuery } from 'src/services/query/classifier/query';
import { sortByDate } from 'src/utils/sort';
import { ClassifierActions, curateColumns } from './curateClassifierColumns';
import styled from 'styled-components';

interface Props {
  classifierActionsCallback?: ClassifierActions;
}

const TableFooter = styled(Flex)`
  padding: 8px 12px;
`;

export const ClassifierTable: React.FC<Props> = ({
  classifierActionsCallback,
}) => {
  const {
    data: classifiers,
    isLoading,
    fetchNextPage,
  } = useDocumentsClassifiersQuery();

  const columns = React.useMemo(
    () => curateColumns(classifierActionsCallback),
    [classifierActionsCallback]
  );

  const data = React.useMemo(() => {
    const nonActiveClassifiers = classifiers?.filter((item) => !item.active);
    return sortByDate(nonActiveClassifiers);
  }, [classifiers]);

  if (isLoading) {
    return <Loader darkMode />;
  }

  return (
    <>
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
      <TableFooter direction="column" alignItems="center">
        <Button onClick={() => fetchNextPage()}>Load more</Button>
      </TableFooter>
    </>
  );
};
