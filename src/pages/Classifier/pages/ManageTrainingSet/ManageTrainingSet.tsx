import { Body, Button, Flex } from '@cognite/cogs.js';
import { PageHeader } from 'components/page';
import { useClassifierConfig } from 'machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from 'machines/classifier/types';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useClassifierManageTrainingSetsQuery } from 'services/query';
import { ClassifierParams } from 'types/params';
import { LabelsModal } from './components/modal/LabelsModal';
import { TrainingSetsTable } from './components/Table/TrainingSetsTable';

export const ManageTrainingSets: FC = () => {
  const { classifierName } = useParams<ClassifierParams>();

  const { description } = useClassifierConfig(ClassifierState.MANAGE);
  const { data } = useClassifierManageTrainingSetsQuery();

  const [showLabelsModal, setShowLabelsModal] = React.useState(false);
  const toggleLabelsModal = React.useCallback(() => {
    setShowLabelsModal((prevState) => !prevState);
  }, []);

  if (showLabelsModal) {
    return (
      <LabelsModal
        visible={showLabelsModal}
        toggleVisibility={toggleLabelsModal}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={classifierName}
        subtitle="Classifier:"
        description={description}
        Action={
          <Flex alignItems="center" gap={8}>
            <Body level={2}>{data.length} labels</Body>
            <Button
              type="primary"
              icon="PlusCompact"
              onClick={() => toggleLabelsModal()}
            >
              Add labels
            </Button>
          </Flex>
        }
      />

      <TrainingSetsTable />
    </>
  );
};
