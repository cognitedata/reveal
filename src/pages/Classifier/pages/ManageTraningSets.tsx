import { Table } from '@cognite/cogs.js';
import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';
import React, { FC } from 'react';
import { ClassifierState } from '../components/step/types';

export const ManageTrainingSets: FC = () => {
  const { updateDescription } = useClassifierActions();

  const setStepDescription = (event: any[]) => {
    if (event.length > 0) {
      updateDescription({
        payload: {
          [ClassifierState.MANAGE]: `${event.length} selected`,
        },
      });
    } else {
      updateDescription({
        payload: {
          [ClassifierState.MANAGE]: undefined,
        },
      });
    }
  };

  return (
    <Table<{ id: number; age: number }>
      onSelectionChange={setStepDescription}
      filterable
      pagination={false}
      dataSource={[
        { id: 10, age: 1 },
        { id: 2, age: 2 },
      ]}
      columns={[
        {
          Header: 'Name',
          accessor: 'name',
          disableSortBy: true,
          Filter: Table.InputFilter(),
          filter: 'fuzzyText',
          filterIcon: 'Search',
        },
        {
          Header: 'Age',
          accessor: 'age',
          disableSortBy: true,
          Filter: Table.CheckboxColumnFilter(),
          filter: 'arrayContains',
        },
      ]}
    />
  );
};
