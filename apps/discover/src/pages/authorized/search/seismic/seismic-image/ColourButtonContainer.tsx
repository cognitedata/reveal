import React from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components/macro';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

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

  const handleChangeColorScheme = (item: SeismicColor) => {
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
          content={
            <Menu>
              {items.map((item) => (
                <Menu.Item
                  key={item.id}
                  onClick={() => {
                    handleChangeColorScheme(item);
                  }}
                >
                  {item.title}
                </Menu.Item>
              ))}
            </Menu>
          }
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
