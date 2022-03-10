import React from 'react';
import { Page } from 'src/components/page/Page';
import { PageContent, PageHeader } from 'src/components/page';
import { homeConfig } from 'src/configs/global.config';
import { Button, Loader } from '@cognite/cogs.js';
import { useDocumentsPipelinesQuery } from 'src/services/query/pipelines/query';
import { useNavigation } from 'src/hooks/useNavigation';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { useClassifierDeleteMutate } from 'src/services/query/classifier/mutate';
import { useActiveClassifier } from 'src/hooks/useActiveClassifier';
import { useDocumentsActiveClassifierPipelineMutate } from 'src/services/query/pipelines/mutate';
import { TableWrapper } from 'src/components/table/TableWrapper';
import ClassifierWidget from './components/widgets/ClassifierWidget';
import { ClassifierTable } from './components/table/ClassifierTable';
import { ReviewModelModal } from './components/modal/ReviewModelModal';
import { ActiveModelContainer } from './components/container/ActiveModelContainer';
import { ClassifierActions } from './components/table/curateClassifierColumns';

const HomePage = () => {
  const { toClassifier } = useNavigation();

  const { data: activeClassifier, isLoading } = useActiveClassifier();

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

  const handleDeployClassifierClick = (classifier: Classifier) => {
    updateActiveClassifierMutate(classifier.id)
      .then(() => {
        toggleConfusionMatrixModal();
      })
      .catch(() => null);
  };

  if (isLoading) {
    return <Loader darkMode />;
  }

  if (selectedClassifier) {
    return (
      <ReviewModelModal
        classifier={selectedClassifier}
        visible={Boolean(selectedClassifier)}
        toggleVisibility={toggleConfusionMatrixModal}
        onDeployClick={handleDeployClassifierClick}
      />
    );
  }

  return (
    <Page Widget={<ClassifierWidget />}>
      <PageHeader
        title={`Trained models for ${pipeline?.classifier?.name}`}
        description={homeConfig.DESCRIPTION}
        Action={
          <Button icon="AddLarge" type="primary" onClick={() => toClassifier()}>
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
  );
};

export default HomePage;
