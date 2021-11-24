import React from 'react';
import { PageHeader, PageContent, Page } from 'components/page';
import {
  useClassifierConfig,
  useClassifierId,
} from 'machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from 'machines/classifier/types';
import ActionContainer from 'pages/Classifier/pages/TrainClassifier/components/containers/ActionContainer';
import { Body, Button, Flex, Tag } from '@cognite/cogs.js';
import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';
import { useClassifierManageTrainingSetsQuery } from 'services/query';
import { useClassifierCreateMutate } from 'services/query/classifier/mutate';
import { useDocumentsClassifierByIdQuery } from 'services/query/classifier/query';
import { useClassifierParams } from 'hooks/useParams';
import { BottomNavigation } from 'pages/Classifier/components/navigations/BottomNavigation';
import { isClassifierFinished } from 'utils/classifier';
import { ClassifierProps } from '../router';
import { TrainClassifierInfoBar } from './components/containers/TrainClassifierInfoBar';
import { TrainClassifierNavigation } from './components/navigation/TrainClassifierNavigation';

const TrainClassifier: React.FC<ClassifierProps> = ({ Widget }) => {
  const { classifierName } = useClassifierParams();
  const { description } = useClassifierConfig(ClassifierState.TRAIN);
  const { previousPage } = useClassifierActions();

  const { data: classifierTrainingSets } =
    useClassifierManageTrainingSetsQuery();
  const { mutateAsync, isLoading } = useClassifierCreateMutate();

  const classifierId = useClassifierId();
  const { setClassifierId } = useClassifierActions();

  const { data: newlyCreatedClassifier } =
    useDocumentsClassifierByIdQuery(classifierId);

  const handleTrainClassifierClick = () => {
    mutateAsync(classifierName).then((result) => {
      setClassifierId(result.id);
    });
  };

  const renderMessage = () => {
    const trainingSets = classifierTrainingSets.length;
    const trainingSetsFiles = classifierTrainingSets.reduce(
      (accumulator, item) => accumulator + (item.count || 0),
      0
    );
    return (
      <Flex gap={8}>
        <Body>Training classifier with</Body>
        <Tag icon="Edit" onClick={previousPage}>
          {trainingSets} labels
        </Tag>
        <Body>using</Body>
        <Tag icon="Edit" onClick={previousPage}>
          {trainingSetsFiles} files
        </Tag>
      </Flex>
    );
  };

  const renderAction = (isRunning: boolean, isDone: boolean) => {
    return (
      <Button
        type="primary"
        loading={isRunning || isLoading}
        icon={isDone ? 'Checkmark' : undefined}
        disabled={isDone || classifierTrainingSets.length === 0}
        onClick={handleTrainClassifierClick}
      >
        {isDone ? 'Training completed' : 'Train classifier'}
      </Button>
    );
  };

  return (
    <Page
      Widget={Widget()}
      BottomNavigation={
        <BottomNavigation>
          <TrainClassifierNavigation
            disabled={!isClassifierFinished(newlyCreatedClassifier)}
          />
        </BottomNavigation>
      }
      breadcrumbs={[{ title: 'New classifier' }]}
    >
      <TrainClassifierInfoBar classifier={newlyCreatedClassifier} />

      <PageHeader title="Train classifier" description={description} />
      <PageContent>
        <>
          <ActionContainer
            classifier={newlyCreatedClassifier}
            Message={renderMessage()}
            Action={renderAction}
          />
        </>
      </PageContent>
    </Page>
  );
};

export default TrainClassifier;
