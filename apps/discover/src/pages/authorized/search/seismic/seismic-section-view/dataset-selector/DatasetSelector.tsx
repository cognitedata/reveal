import React, { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { Select } from 'components/Select/Select';
import { useTranslation } from 'hooks/useTranslation';
import { SurveyFile } from 'modules/seismicSearch/types';

import { HeaderButtonsWrapper } from '../elements';

interface Props {
  datasets: SurveyFile[];
  selectedDatasets: SurveyFile[];
  handleSelect: (item: SurveyFile) => void;
}

export const DatasetSelector: React.FC<Props> = ({
  datasets,
  selectedDatasets,
  handleSelect,
}) => {
  const [opened, setOpened] = useState<boolean>(false);

  const { t } = useTranslation();

  const onClose = () => {
    setOpened(false);
  };

  const onOpen = () => {
    setOpened(true);
  };

  return (
    <HeaderButtonsWrapper>
      <Select
        items={datasets}
        keyField="fileId"
        renderDisplay={(item) => item.fileName}
        onClick={handleSelect}
        onClose={onClose}
        onOpen={onOpen}
        selectedItem={selectedDatasets[0]}
      >
        <Button
          variant="default"
          size="small"
          icon={opened ? 'ChevronUp' : 'ChevronDown'}
          iconPlacement="right"
          data-testid="seismic-dataset-button"
          disabled={!datasets.length}
          aria-label="Dataset button"
        >
          {t('Dataset')}
        </Button>
      </Select>
    </HeaderButtonsWrapper>
  );
};
