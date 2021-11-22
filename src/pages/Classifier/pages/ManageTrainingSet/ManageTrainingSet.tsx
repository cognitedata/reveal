import { Body, Button, Flex } from '@cognite/cogs.js';
import { Page, PageHeader } from 'components/page';
import { useClassifierParams } from 'hooks/useParams';
import { useClassifierConfig } from 'machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from 'machines/classifier/types';
import { BottomNavigation } from 'pages/Classifier/components/navigations/BottomNavigation';
import React, { FC } from 'react';
import { useClassifierManageTrainingSetsQuery } from 'services/query';
import { ClassifierProps } from '../router';
import { LabelsModal } from './components/modal/LabelsModal';
import { ManageTrainingSetNavigation } from './components/navigation/ManageTrainSetNavigation';
import { TrainingSetsTable } from './components/table/TrainingSetsTable';

export const ManageTrainingSets: FC<ClassifierProps> = ({ Widget }) => {
  const { classifierName } = useClassifierParams();

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
    <Page
      Widget={Widget()}
      BottomNavigation={
        <BottomNavigation>
          <ManageTrainingSetNavigation />
        </BottomNavigation>
      }
      breadcrumbs={[{ title: 'New classifier' }]}
    >
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
    </Page>
  );
};
