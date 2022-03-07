import { Body, Button } from '@cognite/cogs.js';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { InfoBar } from 'src/components/InfoBar';
import { useNavigation } from 'src/hooks/useNavigation';
import React from 'react';
import { isClassifierTraining } from 'src/utils/classifier';
import { trainingConfig } from 'src/configs/global.config';

interface Props {
  classifier?: Classifier;
}

export const TrainClassifierInfoBar: React.FC<Props> = ({ classifier }) => {
  const { toHome } = useNavigation();

  return (
    <InfoBar visible={isClassifierTraining(classifier)}>
      <Body level="2">{trainingConfig.INFO_BAR}</Body>
      <Button
        size="small"
        type="primary"
        icon="ArrowRight"
        iconPlacement="right"
        onClick={() => toHome()}
      >
        Go home
      </Button>
    </InfoBar>
  );
};
