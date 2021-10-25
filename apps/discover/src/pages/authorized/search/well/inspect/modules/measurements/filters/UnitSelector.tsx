import React from 'react';

import { Menu } from '@cognite/cogs.js';

import { MoreOptionsButton } from 'components/buttons';
import { HoverDropdown } from 'components/hover-dropdown/HoverDropdown';

import { MEASUREMENTS_REFERENCES, PRESSURE_UNITS } from '../constants';

import {
  UnitCategoryBody,
  UnitCategoryHeader,
  UnitCategoryValue,
  UnitSelectorWrapper,
} from './elements';

export interface Props {
  unit: string;
  reference: string;
  onUnitChange: (value: string) => void;
  onReferenceChange: (value: string) => void;
}
export const UnitSelector: React.FC<Props> = ({
  unit,
  reference,
  onUnitChange,
  onReferenceChange,
}) => {
  return (
    <UnitSelectorWrapper>
      <HoverDropdown
        content={
          <Menu id="mainMenu">
            <Menu.Submenu
              content={
                <Menu id="subMenu">
                  {PRESSURE_UNITS.map((row) => (
                    <Menu.Item
                      key={row}
                      appendIcon={unit === row ? 'Checkmark' : undefined}
                      selected={unit === row}
                      onClick={() => onUnitChange(row)}
                    >
                      {row}
                    </Menu.Item>
                  ))}
                </Menu>
              }
            >
              <UnitCategoryBody>
                <UnitCategoryHeader>Pressure unit</UnitCategoryHeader>
                <UnitCategoryValue>{unit}</UnitCategoryValue>
              </UnitCategoryBody>
            </Menu.Submenu>
            <Menu.Submenu
              content={
                <Menu id="subMenu">
                  {MEASUREMENTS_REFERENCES.map((row) => (
                    <Menu.Item
                      key={row}
                      appendIcon={reference === row ? 'Checkmark' : undefined}
                      selected={reference === row}
                      onClick={() => onReferenceChange(row)}
                    >
                      {row}
                    </Menu.Item>
                  ))}
                </Menu>
              }
            >
              <UnitCategoryBody>
                <UnitCategoryHeader>Measurement reference</UnitCategoryHeader>
                <UnitCategoryValue>{reference}</UnitCategoryValue>
              </UnitCategoryBody>
            </Menu.Submenu>
          </Menu>
        }
      >
        <MoreOptionsButton data-testid="menu-button" size="large" />
      </HoverDropdown>
    </UnitSelectorWrapper>
  );
};
