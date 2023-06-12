import React from 'react';

import { Table } from '@cognite/cogs.js';
import { LabelDefinition } from '@cognite/sdk';
import { useClassifierManageTrainingSetsQuery } from '../../../services/query';
import { useLabelsDeleteMutate } from '../../../services/query/labels/mutate';
import { useLabelsQuery } from '../../../services/query/labels/query';
import { sortByName } from '../../../utils/sort';
import { Loading } from '../../states/Loading';

import { curateColumns } from './curateLabelsColumns';

export type Labels = LabelDefinition & { id: number };

interface Props {
  onSelectionChange: (event: Labels[]) => void;
  showAllLabels?: boolean;
}
export const LabelsTable: React.FC<Props> = React.memo(
  ({ onSelectionChange, showAllLabels }) => {
    const { data: labelsData, isLoading } = useLabelsQuery();
    const { mutate: deleteLabels } = useLabelsDeleteMutate();
    const { data: trainingSetsData } = useClassifierManageTrainingSetsQuery(
      Boolean(showAllLabels)
    );

    const columns = React.useMemo(
      () => curateColumns(deleteLabels),
      [deleteLabels]
    );

    // Hide labels that already exists in the classifier's training set.
    const data = React.useMemo(() => {
      if (showAllLabels) {
        return labelsData;
      }

      return labelsData.filter((label) => {
        return !trainingSetsData.some(
          (trainingSet) => trainingSet.id === label.externalId
        );
      });
    }, [labelsData, trainingSetsData, showAllLabels]);

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
