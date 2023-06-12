import React from 'react';
import { Page } from 'apps/cdf-document-search/src/components/page/Page';
import {
  PageContent,
  PageHeader,
} from 'apps/cdf-document-search/src/components/page';
import { homeConfig } from 'apps/cdf-document-search/src/configs/global.config';
import { Button, Loader } from '@cognite/cogs.js';
import { useDocumentsPipelinesQuery } from 'apps/cdf-document-search/src/services/query/pipelines/query';
import { useNavigation } from 'apps/cdf-document-search/src/hooks/useNavigation';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { useClassifierDeleteMutate } from 'apps/cdf-document-search/src/services/query/classifier/mutate';
import { useDocumentsActiveClassifierQuery } from 'apps/cdf-document-search/src/services/query/classifier/query';
import { useDocumentsActiveClassifierPipelineMutate } from 'apps/cdf-document-search/src/services/query/pipelines/mutate';
import { TableWrapper } from 'apps/cdf-document-search/src/components/table/TableWrapper';
import ClassifierWidget from './components/widgets/ClassifierWidget';
import { ClassifierTable } from './components/table/ClassifierTable';
import { ReviewModelModal } from './components/modal/ReviewModelModal';
import { ActiveModelContainer } from './components/container/ActiveModelContainer';
import { ClassifierActions } from './components/table/curateClassifierColumns';

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
