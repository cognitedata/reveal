import React from 'react';

import { Button, Loader } from '@cognite/cogs.js';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { Page, PageContent, PageHeader } from '../../components/page';
import { TableWrapper } from '../../components/table/TableWrapper';
import { homeConfig } from '../../configs/global.config';
import { useNavigation } from '../../hooks/useNavigation';
import { useDocumentsActiveClassifierQuery } from '../../services/query';
import { useClassifierDeleteMutate } from '../../services/query/classifier/mutate';
import { useDocumentsActiveClassifierPipelineMutate } from '../../services/query/pipelines/mutate';
import { useDocumentsPipelinesQuery } from '../../services/query/pipelines/query';

import { ActiveModelContainer } from './components/container/ActiveModelContainer';
import { ReviewModelModal } from './components/modal/ReviewModelModal';
import { ClassifierTable } from './components/table/ClassifierTable';
import { ClassifierActions } from './components/table/curateClassifierColumns';
import ClassifierWidget from './components/widgets/ClassifierWidget';

const HomePage = () => {
  const { toClassifier } = useNavigation();

  const { data: activeClassifier, isLoading } =
    useDocumentsActiveClassifierQuery();

  const [selectedClassifier, setClassifier] = React.useState<
    Classifier | undefined
  >(undefined);

  const { mutate: deleteClassifierMutate } = useClassifierDeleteMutate();
  const { mutateAsync: updateActiveClassifierMutate } =
    useDocumentsActiveClassifierPipelineMutate();

  const toggleConfusionMatrixModal = (classifier?: Classifier) =>
    setClassifier(classifier);

  const { data: pipeline } = useDocumentsPipelinesQuery();
  // const metrics = useMetrics('Document-Search-UI');

  const handleClassifierTableActionsCallback: ClassifierActions = (
    action,
    classifier
  ) => {
    if (action === 'confusion_matrix') {
      toggleConfusionMatrixModal(classifier);
    }
    if (action === 'delete') {
      deleteClassifierMutate(classifier.id);
    }
  };

  const handleDeployClassifierClick = (classifier?: Classifier) => {
    if (classifier) {
      updateActiveClassifierMutate(classifier.id)
        .then(() => {
          toggleConfusionMatrixModal();
        })
        .catch(() => null);
    }
  };

  if (isLoading) {
    return <Loader darkMode />;
  }

  return (
    <>
      <Page Widget={<ClassifierWidget />}>
        <PageHeader
          title={`Trained models for ${pipeline?.classifier?.name}`}
          description={homeConfig.DESCRIPTION}
          Action={
            <Button
              icon="AddLarge"
              type="primary"
              onClick={() => toClassifier()}
            >
              Train new model
            </Button>
          }
        />

        <PageContent>
          <ActiveModelContainer
            classifier={activeClassifier}
            onViewConfusionMatrixClick={() =>
              toggleConfusionMatrixModal(activeClassifier)
            }
          />

          <PageHeader
            title="Overview"
            titleLevel={4}
            description="Queued and previously trained models"
          />
          <TableWrapper stickyHeader>
            <ClassifierTable
              classifierActionsCallback={handleClassifierTableActionsCallback}
            />
          </TableWrapper>
        </PageContent>
      </Page>
      <ReviewModelModal
        classifier={selectedClassifier}
        visible={Boolean(selectedClassifier)}
        toggleVisibility={toggleConfusionMatrixModal}
        onDeployClick={handleDeployClassifierClick}
      />
    </>
  );
};

export default HomePage;
