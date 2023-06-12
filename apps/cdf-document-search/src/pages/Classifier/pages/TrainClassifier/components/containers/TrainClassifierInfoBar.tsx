import { Body, Button } from '@cognite/cogs.js';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { InfoBar } from 'apps/cdf-document-search/src/components/InfoBar';
import { useNavigation } from 'apps/cdf-document-search/src/hooks/useNavigation';
import React from 'react';
import { isClassifierTraining } from 'apps/cdf-document-search/src/utils/classifier';
import { trainingConfig } from 'apps/cdf-document-search/src/configs/global.config';

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
