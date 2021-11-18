import React from 'react';
import { PageHeader, PageContent } from 'components/page';
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
import { useDocumentsClassifierByIdQuery } from 'services/query/documents/query';
import { useClassifierParams } from 'hooks/useParams';
import { InfoBar } from 'components/InfoBar';
import { isClassifierTraining } from 'utils/classifier';
import { useNavigation } from 'hooks/useNavigation';

const TrainClassifier: React.FC = () => {
  const { classifierName } = useClassifierParams();
  const { toHome } = useNavigation();
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

  const renderInfoBar = () => {
    return (
      <InfoBar visible={isClassifierTraining(newlyCreatedClassifier)}>
        <Body level="2">
          Training a classifier might take some time – You can go back to the
          homepage and deploy the model when it’s ready.
        </Body>
        <Button
          size="small"
          type="primary"
          icon="ArrowForward"
          onClick={() => toHome()}
        >
          Go home
        </Button>
      </InfoBar>
    );
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

  return (
    <>
      {renderInfoBar()}

      <PageHeader title="Train classifier" description={description} />
      <PageContent>
        <>
          <ActionContainer
            classifier={newlyCreatedClassifier}
            Message={renderMessage()}
            Action={(isRunning, isDone) => (
              <Button
                type="primary"
                loading={isRunning || isLoading}
                icon={isDone ? 'Checkmark' : undefined}
                disabled={isDone || classifierTrainingSets.length === 0}
                onClick={handleTrainClassifierClick}
              >
                {isDone ? 'Training completed' : 'Train classifier'}
              </Button>
            )}
          />
        </>
      </PageContent>
    </>
  );
};

export default TrainClassifier;
