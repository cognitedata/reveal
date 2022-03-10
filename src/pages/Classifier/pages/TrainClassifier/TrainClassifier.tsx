import React from 'react';
import { PageHeader, PageContent } from 'src/components/page';
import {
  useClassifierConfig,
  useClassifierId,
} from 'src/machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from 'src/machines/classifier/types';
import TrainClassifierContainer from 'src/pages/Classifier/pages/TrainClassifier/components/containers/TrainClassifierContainer';
import { Button, Flex } from '@cognite/cogs.js';
import { useClassifierActions } from 'src/machines/classifier/hooks/useClassifierActions';
import { useClassifierManageTrainingSetsQuery } from 'src/services/query';
import { useClassifierCreateMutate } from 'src/services/query/classifier/mutate';
import { useDocumentsClassifierByIdQuery } from 'src/services/query/classifier/query';
import { useClassifierName } from 'src/hooks/useClassifierName';
import { isClassifierFinished } from 'src/utils/classifier';
import { CommonClassifierPage } from 'src/pages/Classifier/components/ClassifierPage';
import { useNavigation } from 'src/hooks/useNavigation';
import { ClassifierProps } from '../router';
import { TrainClassifierInfoBar } from './components/containers/TrainClassifierInfoBar';
import { TrainClassifierNavigation } from './components/navigation/TrainClassifierNavigation';

const TrainClassifier: React.FC<ClassifierProps> = ({ Widget }) => {
  const { classifierName } = useClassifierName();
  const { updateDescription } = useClassifierActions();
  const { description } = useClassifierConfig(ClassifierState.TRAIN);

  const { reload } = useNavigation();

  const { data: classifierTrainingSets } =
    useClassifierManageTrainingSetsQuery();
  const { mutateAsync, isLoading } = useClassifierCreateMutate();

  const classifierId = useClassifierId();
  const { setClassifierId } = useClassifierActions();

  const { data: newlyCreatedClassifier } =
    useDocumentsClassifierByIdQuery(classifierId);

  const handleTrainClassifierClick = () => {
    mutateAsync(classifierName)
      .then((result) => {
        setClassifierId(result.id);
      })
      .catch(() => null);
  };

  React.useEffect(() => {
    if (newlyCreatedClassifier?.status) {
      updateDescription({
        [ClassifierState.TRAIN]: newlyCreatedClassifier?.status,
      });
    }
  }, [newlyCreatedClassifier, updateDescription]);

  return (
    <CommonClassifierPage
      Widget={Widget}
      Navigation={
        <TrainClassifierNavigation
          disabled={!isClassifierFinished(newlyCreatedClassifier)}
        />
      }
    >
      <TrainClassifierInfoBar classifier={newlyCreatedClassifier} />

      <PageHeader title="Train classifier" description={description} />

      <PageContent>
        <TrainClassifierContainer
          classifier={newlyCreatedClassifier}
          Action={(isRunning, isDone, status) => (
            <Flex gap={8}>
              <Button
                type="primary"
                loading={isRunning || isLoading}
                icon={isDone ? 'Checkmark' : undefined}
                disabled={isDone || classifierTrainingSets.length === 0}
                onClick={handleTrainClassifierClick}
              >
                {isDone ? 'Training completed' : 'Train classifier'}
              </Button>

              {status === 'failed' && (
                <Button type="primary" icon="Refresh" onClick={() => reload()}>
                  Restart
                </Button>
              )}
            </Flex>
          )}
        />
      </PageContent>
    </CommonClassifierPage>
  );
};

export default TrainClassifier;
