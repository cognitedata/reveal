import React, { ReactNode } from 'react';

import styled from 'styled-components';

import { IconType } from '@cognite/cogs.js';

import { ResourceDetailsHeader } from '../ResourceDetailsHeader';

interface Props {
  icon?: IconType | ReactNode;
  title: string;
  isSelected?: boolean;
  showSelectButton?: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
  closable?: boolean;
}
export const ResourceDetailsTemplate: React.FC<
  React.PropsWithChildren<Props>
> = ({
  icon,
  title,
  isSelected,
  showSelectButton = true,
  onSelectClicked,
  onClose,
  closable,
  children,
}) => {
  return (
    <Wrapper>
      <HeaderWrapper>
        <ResourceDetailsHeader
          title={title}
          icon={icon}
          isSelected={isSelected}
          showSelectButton={showSelectButton}
          onClose={onClose}
          onSelectClicked={onSelectClicked}
          closable={closable}
        ></ResourceDetailsHeader>
      </HeaderWrapper>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const HeaderWrapper = styled.div`
  display: flex;
  padding: 16px;
  border-bottom: 1px solid var(--cogs-border--muted);
`;
