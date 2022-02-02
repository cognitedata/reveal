import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@cognite/cogs.js';

import { Select } from 'components/select/Select';

import { displayTypes } from '../constants';
import { ButtonValue, HeaderButtonsWrapper } from '../elements';
import { SeismicDisplayType } from '../types';

interface Props {
  setDisplayType: (displayType: SeismicDisplayType) => void;
  selected: SeismicDisplayType;
}

export const DisplayTypeSelector: React.FC<Props> = ({
  setDisplayType,
  selected,
}) => {
  const [opened, setOpened] = useState<boolean>(false);

  const { t } = useTranslation();

  const handleChange = (item: SeismicDisplayType) => {
    setDisplayType(item);
  };

  const onClose = () => {
    setOpened(false);
  };

  const onOpen = () => {
    setOpened(true);
  };

  return (
    <HeaderButtonsWrapper>
      <Select
        items={displayTypes}
        keyField="id"
        renderDisplay={(item) => item.title}
        onClick={handleChange}
        onClose={onClose}
        onOpen={onOpen}
        selectedItem={selected}
      >
        <Button
          variant="default"
          size="small"
          icon={opened ? 'ChevronUp' : 'ChevronDown'}
          iconPlacement="right"
          data-testid="seismic-display-type-button"
          aria-label="Display type button"
        >
          {t('Display')}: <ButtonValue>{selected?.title}</ButtonValue>
        </Button>
      </Select>
    </HeaderButtonsWrapper>
  );
};
