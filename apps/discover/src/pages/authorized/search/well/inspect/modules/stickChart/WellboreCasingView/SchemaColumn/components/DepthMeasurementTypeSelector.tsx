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

export interface DepthMeasurementTypeSelectorProps {
  selectedDepthMeasurementType: DepthMeasurementUnit;
  onChangeDepthMeasurementType: (type: DepthMeasurementUnit) => void;
  disableTVD?: boolean;
}

export const DepthMeasurementTypeSelector: React.FC<
  DepthMeasurementTypeSelectorProps
> = ({
  selectedDepthMeasurementType,
  onChangeDepthMeasurementType,
  disableTVD = false,
}) => {
  return (
    <Dropdown
      content={
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() =>
              onChangeDepthMeasurementType(DepthMeasurementUnit.MD)
            }
          >
            {DepthMeasurementUnit.MD}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() =>
              onChangeDepthMeasurementType(DepthMeasurementUnit.TVD)
            }
            disabled={disableTVD}
          >
            {DepthMeasurementUnit.TVD}
          </Dropdown.Item>
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
