import * as React from 'react';

import { Icon } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';
import { DepthMeasurementUnit } from 'constants/units';

import { BodyColumnMainHeader } from '../../../../common/Events/elements';
import {
  DepthMeasurementTypeContainer,
  DepthMeasurementTypeIconWrapper,
  DepthMeasurementTypeWrapper,
} from '../elements';

export const DEPTH_MEASUREMENT_TYPES = [
  DepthMeasurementUnit.TVD,
  DepthMeasurementUnit.MD,
];
export interface DepthMeasurementTypeSelectorProps {
  selectedDepthMeasurementType: DepthMeasurementUnit;
  onChangeDepthMeasurementType: (type: DepthMeasurementUnit) => void;
}

export const DepthMeasurementTypeSelector: React.FC<
  DepthMeasurementTypeSelectorProps
> = ({ selectedDepthMeasurementType, onChangeDepthMeasurementType }) => {
  return (
    <Dropdown
      content={
        <Dropdown.Menu>
          {DEPTH_MEASUREMENT_TYPES.map((depthMeasurementType) => (
            <Dropdown.Item
              key={depthMeasurementType}
              onClick={() => onChangeDepthMeasurementType(depthMeasurementType)}
            >
              {depthMeasurementType}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      }
    >
      <DepthMeasurementTypeContainer>
        <DepthMeasurementTypeWrapper>
          <BodyColumnMainHeader>
            {selectedDepthMeasurementType}
          </BodyColumnMainHeader>
        </DepthMeasurementTypeWrapper>

        <DepthMeasurementTypeIconWrapper>
          <Icon type="ChevronDown" />
        </DepthMeasurementTypeIconWrapper>
      </DepthMeasurementTypeContainer>
    </Dropdown>
  );
};
