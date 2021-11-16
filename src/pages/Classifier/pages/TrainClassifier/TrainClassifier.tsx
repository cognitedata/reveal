import React from 'react';
import { PageHeader, PageContent } from 'components/page';
import {
  useClassifierConfig,
  useClassifierId,
} from 'machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from 'machines/classifier/types';
import ActionContainer from 'pages/Classifier/pages/TrainClassifier/components/ActionContainer';
import { Body, Button, Flex, Tag } from '@cognite/cogs.js';
import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';
import { useClassifierManageTrainingSetsQuery } from 'services/query';
import { useClassifierCreateClassifierMutate } from 'services/query/classifier/mutate';
import { useParams } from 'react-router-dom';
import { ClassifierParams } from 'types/params';
import { useDocumentsClassifierByIdQuery } from 'services/query/documents/query';

const TrainClassifier: React.FC = () => {
  const { classifierName } = useParams<ClassifierParams>();
  const { description } = useClassifierConfig(ClassifierState.TRAIN);
  const { previousPage } = useClassifierActions();

  const { data: classifierTrainingSets } =
    useClassifierManageTrainingSetsQuery();
  const { mutateAsync } = useClassifierCreateClassifierMutate();

  const classifierId = useClassifierId();
  const { setClassifierId } = useClassifierActions();

  const { data: latestModel } = useDocumentsClassifierByIdQuery(classifierId);

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

  return (
    <>
      <PageHeader title="Train classifier" description={description} />
      <PageContent>
        <>
          <ActionContainer
            state={latestModel?.status as any}
            Message={renderMessage()}
            Action={(isRunning, isDone) => (
              <Button
                type="primary"
                loading={isRunning}
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
