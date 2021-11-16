import React, { useEffect } from 'react';
import { useUserContext } from '@cognite/cdf-utilities';
import { handleUserIdentification } from 'utils/config';
import { Page } from 'components/page/Page';
import { PageContent, PageHeader } from 'components/page';
import { homeConfig } from 'configs/global.config';
import { Button } from '@cognite/cogs.js';
import { useDocumentsPipelinesQuery } from 'services/query/documents/query';
import { useNavigation } from 'hooks/useNavigation';
import { Classifier } from '@cognite/sdk-playground';
import { StickyTableHeadContainer } from 'styles/elements';
import ClassifierWidget from './components/widgets/ClassifierWidget';
import { ClassifierTable } from './components/table/ClassifierTable';
import { ConfusionMatrixModal } from './components/modal/ConfusionMatrixModal';

const Home = () => {
  const user = useUserContext();
  const { toClassifier } = useNavigation();

  const [activeClassifier, setClassifier] = React.useState<
    Classifier | undefined
  >(undefined);

  const toggleConfusionMatrixModal = (classifier?: Classifier) =>
    setClassifier(classifier);

  const { data: pipeline } = useDocumentsPipelinesQuery();
  // const metrics = useMetrics('Document-Search-UI');

  useEffect(() => {
    handleUserIdentification(user.username);
  }, [user]);

  const classifierTableActions = React.useCallback((action, classifier) => {
    console.log('action', action, classifier);

    if (action === 'confusion_matrix') {
      toggleConfusionMatrixModal(classifier);
    }
  }, []);

  if (activeClassifier) {
    return (
      <ConfusionMatrixModal
        classifier={activeClassifier}
        visible={!!activeClassifier}
        toggleVisibility={toggleConfusionMatrixModal}
      />
    );
  }

  return (
    <Page Widget={<ClassifierWidget />}>
      <PageHeader
        title={`Trained models for ${pipeline?.classifier.name}`}
        description={homeConfig.DESCRIPTION}
        Action={
          <Button
            icon="PlusCompact"
            type="primary"
            onClick={() => toClassifier(pipeline?.classifier.name || 'No name')}
          >
            Train new model
          </Button>
        }
      />

      <PageHeader
        title="Overview"
        titleLevel={4}
        description="Queued and previously trained models"
      />

      <PageContent>
        <StickyTableHeadContainer>
          <ClassifierTable classifierActionsCallback={classifierTableActions} />
        </StickyTableHeadContainer>
      </PageContent>
    </Page>
  );
};

export default Home;
