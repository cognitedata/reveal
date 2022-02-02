import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@cognite/cogs.js';

import { Select } from 'components/select/Select';

import { colors } from '../constants';
import { HeaderButtonsWrapper } from '../elements';
import { SeismicColor, Tuplet } from '../types';

import { ColorScale } from './ColorScale';

interface Props {
  amplitudeRange: Tuplet;
  setColorScale: (id: string) => void;
  setColorScaleRange: (range: Tuplet) => void;
}
export const ColorSelector: React.FC<Props> = ({
  amplitudeRange,
  setColorScale,
  setColorScaleRange,
}) => {
  const [currentColour, setCurrentColour] = useState<SeismicColor>(colors[0]);
  const [opened, setOpened] = useState<boolean>(false);

  const { t } = useTranslation();

  const onClose = () => {
    setOpened(false);
  };

  const onOpen = () => {
    setOpened(true);
  };

  const handleChange = (item: SeismicColor) => {
    setCurrentColour(item);
    setColorScale(item.id);
  };

  return (
    <>
      <HeaderButtonsWrapper>
        <Select
          items={colors}
          keyField="id"
          renderDisplay={(item) => item.title}
          onClick={handleChange}
          onClose={onClose}
          onOpen={onOpen}
          selectedItem={currentColour}
        >
          <Button
            variant="default"
            size="small"
            icon={opened ? 'ChevronUp' : 'ChevronDown'}
            iconPlacement="right"
            data-testid="seismic-color-band-button"
            aria-label="Color band button"
          >
            {t('Color band')}
          </Button>
        </Select>
      </HeaderButtonsWrapper>

      <ColorScale
        {...currentColour}
        setColorScaleRange={setColorScaleRange}
        amplitudeRange={amplitudeRange}
      />
    </>
  );
};
