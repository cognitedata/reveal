import { useState } from 'react';

import styled from 'styled-components';

import { Button, Dropdown, Flex, IconType } from '@cognite/cogs.js';

export const ModelTypeButton = ({
  icon,
  onVisibilityChange,
  dropdownContent,
  children,
}: {
  icon: IconType;
  dropdownContent?: React.ReactNode;
  onVisibilityChange: (value: boolean) => void;
  children?: string;
}): JSX.Element => {
  const [toggled, setToggled] = useState(true);

  return (
    <Flex direction="row" gap={2}>
      <RightSideRestyledButton
        icon={toggled ? 'EyeShow' : 'EyeHide'}
        onClick={() => {
          setToggled(!toggled);
          onVisibilityChange(!toggled);
        }}
      />
      <Dropdown content={dropdownContent}>
        <LeftSideRestyledButton icon={icon}>{children}</LeftSideRestyledButton>
      </Dropdown>
    </Flex>
  );
};

const RightSideRestyledButton = styled(Button)`
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
`;

const LeftSideRestyledButton = styled(Button)`
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
`;
