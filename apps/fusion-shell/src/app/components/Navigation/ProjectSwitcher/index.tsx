import React, { useState } from 'react';

import styled from 'styled-components';

import { Dropdown } from 'antd';

import { getProject } from '@cognite/cdf-utilities';

import { PROJECT_SWITCHER_WIDTH } from '../../../utils/constants';
import { ProjectDropdown } from '../ProjectDropdown';
import { StyledSectionDropdownButton } from '../TopBar/TopBarSections';

export const ProjectSwitcher = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  return (
    <Dropdown
      onVisibleChange={setIsDropdownVisible}
      overlay={<ProjectDropdown />}
      trigger={['click']}
    >
      <StyledSectionDropdownButton
        $isVisible={isDropdownVisible}
        icon="ChevronDownSmall"
        iconPlacement="right"
        type="ghost"
        inverted
      >
        <StyledProjectName>{getProject()}</StyledProjectName>
      </StyledSectionDropdownButton>
    </Dropdown>
  );
};

const StyledProjectName = styled.div`
  max-width: ${PROJECT_SWITCHER_WIDTH}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
