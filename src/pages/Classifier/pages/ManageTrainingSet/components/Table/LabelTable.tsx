import { Loader, Table } from '@cognite/cogs.js';
import { useNavigation } from 'hooks/useNavigation';
import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';
import { ClassifierState } from 'machines/classifier/types';
import React from 'react';
import { useClassifierManageTrainingSetsQuery } from 'services/query/classifier/query';
import { ClassifierTrainingSet } from 'services/types';
import { curateColumns } from './curateLabelColumns';

export const LabelTable: React.FC = () => {
  const { data, isLoading } = useClassifierManageTrainingSetsQuery();

  const navigate = useNavigation();
  const columns = React.useMemo(() => curateColumns(navigate), [navigate]);

  const { updateDescription } = useClassifierActions();

  const setStepDescription = (event: ClassifierTrainingSet[]) => {
    updateDescription({
      payload: {
        [ClassifierState.MANAGE]:
          event.length > 0 ? `${event.length} selected` : undefined,
      },
    });
  };

  if (isLoading) {
    return <Loader darkMode />;
  }

  return (
    <Table<ClassifierTrainingSet>
      onSelectionChange={setStepDescription}
      pagination={false}
      filterable
      dataSource={data}
      columns={columns as any}
    />
  );
};
