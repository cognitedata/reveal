import React from 'react';
import { PageHeader, PageContent } from 'components/page';
import {
  useClassifierConfig,
  useClassifierId,
} from 'machines/classifier/hooks/useClassifierSelectors';
import { ClassifierState } from 'machines/classifier/types';
import TrainClassifierContainer from 'pages/Classifier/pages/TrainClassifier/components/containers/TrainClassifierContainer';
import { Button, Flex } from '@cognite/cogs.js';
import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';
import { useClassifierManageTrainingSetsQuery } from 'services/query';
import { useClassifierCreateMutate } from 'services/query/classifier/mutate';
import { useDocumentsClassifierByIdQuery } from 'services/query/classifier/query';
import { useClassifierParams } from 'hooks/useParams';
import { isClassifierFinished } from 'utils/classifier';
import { CommonClassifierPage } from 'pages/Classifier/components/ClassifierPage';
import { useNavigation } from 'hooks/useNavigation';
import { ClassifierProps } from '../router';
import { TrainClassifierInfoBar } from './components/containers/TrainClassifierInfoBar';
import { TrainClassifierNavigation } from './components/navigation/TrainClassifierNavigation';

const TrainClassifier: React.FC<ClassifierProps> = ({ Widget }) => {
  const { classifierName } = useClassifierParams();
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
