import { Table } from '@cognite/cogs.js';
import { LabelDefinition } from '@cognite/sdk';
import { Loading } from 'components/states/Loading';
import React from 'react';
import { useClassifierManageTrainingSetsQuery } from 'services/query';
import { useLabelsQuery } from 'services/query/labels/query';
import { sortByName } from 'utils/sort';
import { curateColumns } from './curateLabelsColumns';

export type Labels = LabelDefinition & { id: number };

interface Props {
  onSelectionChange: (event: Labels[]) => void;
}
export const LabelsTable: React.FC<Props> = React.memo(
  ({ onSelectionChange }) => {
    const { data: labelsData, isLoading } = useLabelsQuery();
    const { data: trainingSetsData } = useClassifierManageTrainingSetsQuery();

    const columns = React.useMemo(() => curateColumns(), []);

    // Hide labels that already exists in the classifier's training set.
    const data = React.useMemo(() => {
      return labelsData.filter((label) => {
        return !trainingSetsData.some(
          (trainingSet) => trainingSet.id === label.externalId
        );
      });
    }, [labelsData, trainingSetsData]);

    if (isLoading) {
      return <Loading />;
    }

    return (
      <Table<Labels>
        onSelectionChange={onSelectionChange}
        pagination={false}
        filterable
        dataSource={sortByName(data) as Labels[]}
        columns={columns as any}
      />
    );
  }
);
