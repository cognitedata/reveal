import React from 'react';

import noop from 'lodash/noop';

import { Button } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';
import { FlexColumn } from 'styles/layout';

import {
  NDS_EVENT_DETAILS_LABEL,
  NPT_EVENT_DETAILS_LABEL,
} from '../../../../common/Events/constants';

import { HeaderWrapper, Subtitle, Title } from './elements';

interface HeaderProps {
  wellName: string;
  wellboreName: string;
  onChangeDropdown: ({
    wellName,
    wellboreName,
  }: {
    wellName: string;
    wellboreName: string;
  }) => void;
}

export const Header: React.FC<HeaderProps> = ({
  wellName,
  wellboreName,
  onChangeDropdown,
}) => {
  const handleChangeDropdown = () => {
    onChangeDropdown({ wellName, wellboreName });
  };

  return (
    <HeaderWrapper>
      <FlexColumn>
        <Title>{wellName}</Title>
        <Subtitle>{wellboreName}</Subtitle>
      </FlexColumn>

      <Dropdown
        content={
          <Dropdown.Menu>
            <Dropdown.Item onClick={noop} disabled>
              {NDS_EVENT_DETAILS_LABEL}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleChangeDropdown}>
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
