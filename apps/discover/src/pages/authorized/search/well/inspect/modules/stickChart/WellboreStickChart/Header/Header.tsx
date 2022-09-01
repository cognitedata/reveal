import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';
import { FlexColumn } from 'styles/layout';

import {
  NDS_EVENT_DETAILS_LABEL,
  NPT_EVENT_DETAILS_LABEL,
} from '../../../common/Events/constants';

import { HeaderWrapper, WellboreName, WellName } from './elements';

interface HeaderProps {
  wellName: string;
  wellboreName: string;
  wellboreMatchingId: string;
  onChangeDropdown: ({
    wellName,
    wellboreName,
  }: {
    eventType: 'npt' | 'nds';
    wellName: string;
    wellboreName: string;
    wellboreMatchingId: string;
  }) => void;
}

export const Header: React.FC<HeaderProps> = ({
  wellName,
  wellboreName,
  wellboreMatchingId,
  onChangeDropdown,
}) => {
  const handleChangeNptDropdown = () => {
    onChangeDropdown({
      eventType: 'npt',
      wellName,
      wellboreName,
      wellboreMatchingId,
    });
  };

  const handleChangeNdsDropdown = () => {
    onChangeDropdown({
      eventType: 'nds',
      wellName,
      wellboreName,
      wellboreMatchingId,
    });
  };

  return (
    <HeaderWrapper>
      <FlexColumn>
        <WellName>{wellName}</WellName>
        <WellboreName>{wellboreName}</WellboreName>
      </FlexColumn>

      <Dropdown
        content={
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleChangeNdsDropdown}>
              {NDS_EVENT_DETAILS_LABEL}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleChangeNptDropdown}>
              {NPT_EVENT_DETAILS_LABEL}
            </Dropdown.Item>
          </Dropdown.Menu>
        }
      >
        <Button icon="ChevronDown" iconPlacement="right">
          Details
        </Button>
      </Dropdown>
    </HeaderWrapper>
  );
};
