import React from 'react';
import { useTranslation } from 'react-i18next';

import { TS_FIX_ME } from 'core';
import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

import { Dropdown } from 'components/dropdown';
import { sizes } from 'styles/layout';

import { ColorScale } from './ColorScale';
import items, { SeismicColor } from './SeismicColors';

const ColourButtonsWrapper = styled.div`
  margin-bottom: ${sizes.small};
`;

interface Props {
  setColorScale: (id: string) => void;
}
export const ColourButtonContainer: React.FC<Props> = ({ setColorScale }) => {
  const [currentColour, setCurrentColour] = React.useState<SeismicColor>(
    items[0]
  );

  const { t } = useTranslation();

  const handleChangeColorScheme = (_event: TS_FIX_ME, value: TS_FIX_ME) => {
    const item = items.find((y) => y.id === value.id);
    if (item) {
      // callback
      setColorScale(item.id);
      setCurrentColour(item);
    }
  };

  return (
    <ColourButtonsWrapper>
      <ColorScale {...currentColour} />
      <div>
        <Dropdown
          items={items}
          valueField="id"
          displayField="title"
          handleChange={handleChangeColorScheme}
          selected={{ id: currentColour.id }}
        >
          <Button
            variant="default"
            size="small"
            data-testid="seismic-color-button"
          >
            {t('Color band')}
          </Button>
        </Dropdown>
      </div>
    </ColourButtonsWrapper>
  );
};
